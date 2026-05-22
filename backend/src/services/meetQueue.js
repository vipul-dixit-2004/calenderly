import { generateMeetLink } from './googleMeet.js';
import { db } from '../db/index.js';
import { meetings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import * as mailService from './mail/index.js';

const pending = [];
let processing = false;

/**
 * In-memory async queue for Meet link generation & email dispatch.
 *
 * Processing flow per job:
 *   1. Generate Google Meet link via Calendar API
 *   2. Update the meeting row in DB with the link
 *   3. Send confirmation email to invitee
 *   4. Send confirmation email to host
 */
export const meetQueue = {
  /**
   * Add a Meet-link job.
   *
   * @param {object}  job
   * @param {string}  job.meetingId      – UUID of the meeting row
   * @param {string}  job.summary        – calendar event title
   * @param {string}  job.description    – event description
   * @param {Date}    job.startTime      – meeting start
   * @param {Date}    job.endTime        – meeting end
   * @param {string}  job.attendeeEmail  – invitee email
   * @param {object}  job.emailPayload   – payload for invitee email
   * @param {string}  job.hostEmail      – host email address
   * @param {string}  job.hostName       – host display name
   */
  add(job) {
    pending.push(job);
    if (!processing) processQueue();
  },

  /** Current queue depth (for monitoring) */
  get size() {
    return pending.length;
  },
};

async function processQueue() {
  processing = true;

  while (pending.length > 0) {
    const job = pending.shift();
    const { meetingId, summary, description, startTime, endTime, attendeeEmail, emailPayload, hostEmail, hostName } = job;

    try {
      // 1. Generate the Google Meet link via Calendar API
      const meetUrl = await generateMeetLink({
        summary,
        description,
        startTime,
        endTime,
        attendeeEmail,
      });

      // 2. Save the link to DB
      await db
        .update(meetings)
        .set({ meetUrl })
        .where(eq(meetings.id, meetingId));
      console.log(`✅ Meet URL saved to DB for meeting ${meetingId}`);

      // 3. Send the confirmation email to the INVITEE
      const inviteePayload = {
        ...emailPayload,
        data: {
          ...emailPayload.data,
          meetUrl,
        },
      };
      await mailService.send(inviteePayload);
      console.log(`📨 Confirmation email sent to invitee: ${attendeeEmail}`);

      // 4. Send the confirmation email to the HOST
      if (hostEmail) {
        const hostPayload = {
          to: hostEmail,
          subject: emailPayload.subject,
          template: emailPayload.template,
          data: {
            ...emailPayload.data,
            meetUrl,
            inviteeName: emailPayload.data.inviteeName,
          },
        };
        await mailService.send(hostPayload);
        console.log(`📨 Confirmation email sent to host: ${hostEmail}`);
      }
    } catch (err) {
      console.error(`❌ Meet queue job failed for meeting ${meetingId}:`, err.message);

      // Still try to send the email without the meet link
      try {
        const fallbackPayload = {
          ...emailPayload,
          data: { ...emailPayload.data, meetUrl: null },
        };
        await mailService.send(fallbackPayload);
        console.log(`📨 Fallback email (no Meet link) sent to ${attendeeEmail}`);
      } catch (mailErr) {
        console.error('Failed to send fallback email:', mailErr.message);
      }
    }
  }

  processing = false;
}

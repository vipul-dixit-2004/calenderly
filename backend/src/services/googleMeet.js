import crypto from 'crypto';
import { calendar } from '../config/google.js';

/**
 * Create a Google Calendar event with an auto-generated Google Meet link.
 *
 * @param {object}  opts
 * @param {string}  opts.summary        – event title
 * @param {string}  opts.description    – event description
 * @param {Date}    opts.startTime      – start datetime
 * @param {Date}    opts.endTime        – end datetime
 * @param {string}  opts.attendeeEmail  – invitee email (informational only)
 * @returns {Promise<string>}           – the Google Meet URL
 */
export async function generateMeetLink({ summary, description, startTime, endTime, attendeeEmail }) {
  const event = {
    summary,
    description: description || '',
    start: { dateTime: new Date(startTime).toISOString() },
    end:   { dateTime: new Date(endTime).toISOString() },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),          // unique per request
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,                    // MUST be 1
    sendUpdates: 'none',                         // we send our own emails
  });

  const meetUrl = response.data.hangoutLink;
  console.log(`📅 Google Meet link created → ${meetUrl}`);
  return meetUrl;
}

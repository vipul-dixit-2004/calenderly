import { db } from '../../../db/index.js';
import { meetings, eventTypes, users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import * as mailService from '../../mail/index.js';

export async function sendEmailTool({ userId, args }) {
  const { to, subject, bodyText, relatedMeetingId } = args;

  const [row] = await db
    .select({
      ownerId:      eventTypes.userId,
      inviteeEmail: meetings.inviteeEmail,
      inviteeName:  meetings.inviteeName,
      eventTitle:   eventTypes.title,
      startTime:    meetings.startTime,
      endTime:      meetings.endTime,
      duration:     eventTypes.duration,
      hostName:     users.name,
    })
    .from(meetings)
    .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
    .innerJoin(users, eq(users.id, eventTypes.userId))
    .where(eq(meetings.id, relatedMeetingId));

  if (!row) {
    return { ok: false, error: 'Meeting not found.' };
  }
  if (row.ownerId !== userId) {
    return { ok: false, error: 'You do not own that meeting.' };
  }
  if (row.inviteeEmail.toLowerCase() !== to.toLowerCase()) {
    return {
      ok: false,
      error: `Recipient (${to}) does not match the invitee on that meeting (${row.inviteeEmail}).`,
    };
  }

  await mailService.send({
    to,
    subject,
    template: 'ai-message',
    data: {
      inviteeName: row.inviteeName,
      hostName:    row.hostName,
      eventTitle:  row.eventTitle,
      startTime:   row.startTime,
      endTime:     row.endTime,
      duration:    row.duration,
      bodyText,
    },
  });

  return { ok: true, queued: true, to, subject };
}

import { getMeetingsTool }     from './getMeetings.js';
import { getEventTypesTool }   from './getEventTypes.js';
import { getAvailabilityTool } from './getAvailability.js';
import { runReadOnlySelect }   from './sqlSandbox.js';
import { sendEmailTool }       from './sendEmail.js';

export async function runTool({ name, args, ctx }) {
  switch (name) {
    case 'getMeetings':
      return getMeetingsTool({ userId: ctx.user.id, userTimezone: ctx.user.timezone, args });
    case 'getEventTypes':
      return getEventTypesTool({ userId: ctx.user.id, args });
    case 'getAvailability':
      return getAvailabilityTool({ userId: ctx.user.id });
    case 'runReadOnlyQuery':
      return runReadOnlySelect({ sql: args.sql, userId: ctx.user.id });
    case 'sendEmail':
      return sendEmailTool({ userId: ctx.user.id, args });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

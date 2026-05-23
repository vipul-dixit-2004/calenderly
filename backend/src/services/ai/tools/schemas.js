export const toolDeclarations = [
  {
    functionDeclarations: [
      {
        name: 'getMeetings',
        description:
          "Fetch the logged-in user's meetings. Use this for 'what meetings do I have', 'today\\'s meetings', 'next meeting', 'this week' etc. Always prefer this over runReadOnlyQuery for simple meeting lookups.",
        parameters: {
          type: 'OBJECT',
          properties: {
            status: {
              type: 'STRING',
              enum: ['upcoming', 'past', 'all', 'today', 'this_week'],
              description:
                "Filter scope. 'today' returns meetings whose start_time falls within the user's current local day. 'upcoming' = future scheduled meetings. 'past' = completed/cancelled/past meetings.",
            },
            limit: {
              type: 'INTEGER',
              description: 'Max meetings to return (default 50, max 200).',
            },
          },
          required: ['status'],
        },
      },
      {
        name: 'getEventTypes',
        description:
          "Fetch the user's configured event types (e.g. '30-min call', 'Quick chat'). Use this when asked about meeting types, durations, or what kinds of meetings the user offers.",
        parameters: {
          type: 'OBJECT',
          properties: {
            activeOnly: {
              type: 'BOOLEAN',
              description: 'If true, only return is_active = true rows.',
            },
          },
        },
      },
      {
        name: 'getAvailability',
        description:
          "Fetch the user's weekly availability rules and any date overrides. Use this when asked about free time, working hours, or availability on specific days.",
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
      {
        name: 'runReadOnlyQuery',
        description:
          'Run a custom SELECT-only Postgres query when the pre-built tools cannot answer the question (e.g. aggregations, date ranges, grouping by invitee). The query MUST include a filter scoping results to the current user. The system will reject anything that is not a single SELECT statement.',
        parameters: {
          type: 'OBJECT',
          properties: {
            sql: {
              type: 'STRING',
              description:
                "A single SELECT statement. No trailing semicolons. No CTEs that modify data. Must reference the current user's ID in a WHERE clause.",
            },
            reason: {
              type: 'STRING',
              description: 'One sentence explaining what this query answers (for audit logs).',
            },
          },
          required: ['sql', 'reason'],
        },
      },
      {
        name: 'sendEmail',
        description:
          "Send an email to one of the user's invitees (e.g. a reminder, polite reschedule ask, or follow-up). Always confirm with the user before calling this tool unless they have already authorized the send in this conversation. The 'to' address must match an invitee_email on a meeting owned by this user.",
        parameters: {
          type: 'OBJECT',
          properties: {
            to: {
              type: 'STRING',
              description: "Invitee email. Must match a meeting row owned by this user.",
            },
            subject: {
              type: 'STRING',
              description: 'Email subject line.',
            },
            bodyText: {
              type: 'STRING',
              description: 'The email body text. Write it naturally — HTML wrapping is automatic.',
            },
            relatedMeetingId: {
              type: 'STRING',
              description: 'UUID of the meeting this email is about (used for ownership verification).',
            },
          },
          required: ['to', 'subject', 'bodyText', 'relatedMeetingId'],
        },
      },
    ],
  },
];

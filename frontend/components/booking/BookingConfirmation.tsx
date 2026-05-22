'use client';

interface Props {
  event: {
    title: string;
    duration: number;
    hostName: string;
    hostTimezone: string;
    color: string;
    meetType: string;
  };
  meeting: {
    startTime: string;
    endTime: string;
    inviteeName: string;
    inviteeEmail: string;
    meetUrl?: string | null;
    meetAddress?: string | null;
    meetPhone?: string | null;
  };
}

export default function BookingConfirmation({ event, meeting }: Props) {
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);

  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Google Calendar link
  const gcalStart = toGcalDate(start);
  const gcalEnd = toGcalDate(end);
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${gcalStart}/${gcalEnd}&details=${encodeURIComponent(`Meeting with ${event.hostName}`)}`;

  return (
    <div className="confirm-card">
      <div className="confirm-check" style={{ background: event.color }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="confirm-title">You are scheduled</h1>
      <p className="confirm-subtitle">
        A calendar invitation has been sent to your email address.
      </p>

      <div className="confirm-details">
        <div className="confirm-detail-row">
          <span className="confirm-detail-label">What</span>
          <span className="confirm-detail-value">{event.title}</span>
        </div>
        <div className="confirm-detail-row">
          <span className="confirm-detail-label">When</span>
          <span className="confirm-detail-value">
            {dateStr}
            <br />
            {timeStr} — {endStr} ({event.duration} min)
          </span>
        </div>
        <div className="confirm-detail-row">
          <span className="confirm-detail-label">Who</span>
          <span className="confirm-detail-value">
            {event.hostName} (Host)
            <br />
            {meeting.inviteeName} ({meeting.inviteeEmail})
          </span>
        </div>
        <div className="confirm-detail-row">
          <span className="confirm-detail-label">Where</span>
          <span className="confirm-detail-value">
            {event.meetType === 'google_meet' && (
              <>
                <strong>Google Meet:</strong>{' '}
                <a href={meeting.meetUrl || '#'} target="_blank" rel="noreferrer" style={{ color: event.color }}>
                  {meeting.meetUrl}
                </a>
              </>
            )}
            {event.meetType === 'offline' && (
              <>
                <strong>In-Person:</strong> {meeting.meetAddress}
              </>
            )}
            {event.meetType === 'phone' && (
              <>
                <strong>Phone Call:</strong> {meeting.meetPhone}
              </>
            )}
            <br />
            <span style={{ fontSize: '0.9em', color: '#6b7280', marginTop: '4px', display: 'inline-block' }}>
              {event.hostTimezone} timezone
            </span>
          </span>
        </div>
      </div>

      <a
        href={gcalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary confirm-gcal-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Add to Google Calendar
      </a>
    </div>
  );
}

function toGcalDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

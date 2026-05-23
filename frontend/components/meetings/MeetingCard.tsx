import { useState } from 'react';
import Link from 'next/link';

interface Meeting {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string;
  endTime: string;
  status: string;
  cancelReason: string | null;
  eventTitle: string;
  duration: number;
  color: string;
  slug: string;
}

interface Props {
  meeting: Meeting;
  onCancel: (id: string, reason: string) => void;
}

export default function MeetingCard({ meeting, onCancel }: Props) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);

  const formatTimeShort = (d: Date) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();

  const startShort = formatTimeShort(startDate);
  const endShort   = formatTimeShort(endDate);
  const startLong  = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const endLong    = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');

  const avatarColor = meeting.color || '#6C63FF';

  return (
    <>
      <div className="mc-card">
        {/* Avatar */}
        <div className="mc-avatar" style={{ background: avatarColor }} />

        {/* Time block */}
        <div className="mc-time-block">
          <div className="mc-time-primary">{startShort} – {endShort}</div>
          <div className="mc-time-secondary">
            {startLong} - {endLong} ({tzName})
          </div>
        </div>

        {/* Invitees + event type */}
        <div className="mc-invitees-block">
          <div className="mc-invitee-count">1 Invitee</div>
          <div className="mc-event-type">
            Event type <strong>{meeting.eventTitle}</strong>
          </div>
        </div>

        {/* Host info */}
        <div className="mc-host-info">
          1 host&nbsp;|&nbsp;0 non-hosts
        </div>

        {/* Details button */}
        <button
          className="mc-details-btn"
          onClick={() => setShowDetails(v => !v)}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"
            style={{ transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Details
        </button>
      </div>

      {/* Expanded details panel */}
      {showDetails && (
        <div className="mc-details-panel">
          <div className="mc-details-row">
            <span className="mc-details-label">Invitee</span>
            <span>{meeting.inviteeName} &lt;{meeting.inviteeEmail}&gt;</span>
          </div>
          <div className="mc-details-row">
            <span className="mc-details-label">Duration</span>
            <span>{meeting.duration} minutes</span>
          </div>
          {meeting.status === 'cancelled' && meeting.cancelReason && (
            <div className="mc-details-row">
              <span className="mc-details-label">Cancel reason</span>
              <span style={{ color: 'var(--color-error)' }}>{meeting.cancelReason}</span>
            </div>
          )}
          {meeting.status === 'scheduled' && (
            <div className="mc-details-actions">
              <Link href={`/reschedule/${meeting.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                Reschedule
              </Link>
              <button className="btn btn-danger btn-sm" onClick={() => setShowCancel(true)}>
                Cancel Meeting
              </button>
            </div>
          )}
        </div>
      )}

      {showCancel && (
        <div className="modal-overlay" onClick={() => setShowCancel(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Cancel Meeting?</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Are you sure you want to cancel your meeting with {meeting.inviteeName}?
              </p>
              <div className="form-group">
                <label className="form-label">Reason for cancellation (optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g., Unexpected conflict, will reschedule..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCancel(false)}>Back</button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  onCancel(meeting.id, cancelReason);
                  setShowCancel(false);
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

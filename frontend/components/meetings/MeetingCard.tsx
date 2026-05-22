import { useState } from 'react';

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

  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const timeString = `${formatTime(startDate)} - ${formatTime(endDate)}, ${formatDate(startDate)}`;

  return (
    <>
      <div 
        className="meeting-card" 
        style={{ '--meeting-color': meeting.color || 'var(--color-primary)' } as React.CSSProperties}
      >
        <div className="meeting-card-info">
          <div className="meeting-card-time">{timeString}</div>
          <div className="meeting-card-title">{meeting.eventTitle}</div>
          <div className="meeting-card-invitee">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {meeting.inviteeName} ({meeting.inviteeEmail})
          </div>
          {meeting.status === 'cancelled' && meeting.cancelReason && (
            <div style={{ fontSize: 13, color: 'var(--color-error)', marginTop: 4 }}>
              Reason: {meeting.cancelReason}
            </div>
          )}
        </div>
        
        <div className="meeting-card-actions">
          <span className={`meeting-status meeting-status--${meeting.status}`}>
            {meeting.status}
          </span>
          {meeting.status === 'scheduled' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCancel(true)}>
              Cancel
            </button>
          )}
        </div>
      </div>

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

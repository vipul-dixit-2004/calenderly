'use client';

import { useState } from 'react';

interface Props {
  onBack: () => void;
  onSubmit: (reason: string) => void;
  submitting: boolean;
  selectedDate: string;
  selectedTime: string;
  duration: number;
}

export default function RescheduleForm({
  onBack,
  onSubmit,
  submitting,
  selectedDate,
  selectedTime,
  duration,
}: Props) {
  const [reason, setReason] = useState('');

  const dateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = new Date(selectedTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const endTime = new Date(new Date(selectedTime).getTime() + duration * 60000);
  const endLabel = endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason.trim());
  };

  return (
    <div className="booking-form-panel">
      <div className="booking-form-header">
        <button className="btn btn-ghost" onClick={onBack} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      </div>

      <div className="booking-form-summary">
        <div className="booking-form-summary-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{dateLabel}</span>
        </div>
        <div className="booking-form-summary-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{timeLabel} — {endLabel} ({duration} min)</span>
        </div>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <h2 className="booking-form-title">Confirm Reschedule</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="reschedule-reason">Reason for rescheduling (optional)</label>
          <textarea
            id="reschedule-reason"
            className="form-input form-textarea"
            placeholder="e.g. A sudden conflict came up..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary booking-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Confirming…
            </>
          ) : (
            'Confirm Reschedule'
          )}
        </button>
      </form>
    </div>
  );
}

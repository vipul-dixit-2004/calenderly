'use client';

import { useState } from 'react';

interface Props {
  onBack: () => void;
  onSubmit: (name: string, email: string, meetAddress?: string, meetPhone?: string) => void;
  submitting: boolean;
  selectedDate: string;
  selectedTime: string;
  duration: number;
  meetType: string;
  meetUrl?: string | null;
}

export default function BookingForm({
  onBack,
  onSubmit,
  submitting,
  selectedDate,
  selectedTime,
  duration,
  meetType,
  meetUrl,
}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [meetAddress, setMeetAddress] = useState('');
  const [meetPhone, setMeetPhone] = useState('');

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
    if (!name.trim() || !email.trim()) return;
    if (meetType === 'offline' && !meetAddress.trim()) return;
    if (meetType === 'phone' && !meetPhone.trim()) return;
    onSubmit(name.trim(), email.trim(), meetAddress.trim(), meetPhone.trim());
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

      {/* Meet type info banner */}
      <div className="booking-meet-info">
        {meetType === 'google_meet' && (
          <div className="booking-meet-badge booking-meet-badge--google">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.311a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
            </svg>
            <span>Google Meet link will be provided after booking</span>
          </div>
        )}
        {meetType === 'phone' && (
          <div className="booking-meet-badge booking-meet-badge--phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
            </svg>
            <span>Please enter the phone number for the call below</span>
          </div>
        )}
        {meetType === 'offline' && (
          <div className="booking-meet-badge booking-meet-badge--offline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Please enter the meeting location / address below</span>
          </div>
        )}
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <h2 className="booking-form-title">Enter Details</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="invitee-name">Name *</label>
          <input
            id="invitee-name"
            className="form-input"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="invitee-email">Email *</label>
          <input
            id="invitee-email"
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        {meetType === 'offline' && (
          <div className="form-group">
            <label className="form-label" htmlFor="meet-address">Meeting Address *</label>
            <input
              id="meet-address"
              className="form-input"
              type="text"
              placeholder="e.g. 123 Coffee Shop, NY"
              value={meetAddress}
              onChange={e => setMeetAddress(e.target.value)}
              required
            />
          </div>
        )}

        {meetType === 'phone' && (
          <div className="form-group">
            <label className="form-label" htmlFor="meet-phone">Phone Number *</label>
            <input
              id="meet-phone"
              className="form-input"
              type="tel"
              placeholder="+1 234 567 8900"
              value={meetPhone}
              onChange={e => setMeetPhone(e.target.value)}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary booking-submit-btn"
          disabled={
            submitting ||
            !name.trim() ||
            !email.trim() ||
            (meetType === 'offline' && !meetAddress.trim()) ||
            (meetType === 'phone' && !meetPhone.trim())
          }
        >
          {submitting ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Scheduling…
            </>
          ) : (
            'Schedule Event'
          )}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface EventType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  description: string | null;
  color: string;
  isActive: boolean;
  meetType: string;
  meetUrl?: string | null;
}

interface Props {
  event: EventType;
  username: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function EventTypeCard({ event, username, onToggle, onDelete, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const bookingUrl = `${window.location.origin}/${username}/${event.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="event-card" style={{ '--card-color': event.color } as React.CSSProperties}>
      <style>{`.event-card::before { background: var(--card-color); }`}</style>

      <div className="event-card-header">
        <div>
          <h3 className="event-card-title">{event.title}</h3>
          <div className="event-card-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {event.duration} min
          </div>
        </div>
        <span className={`event-card-status ${event.isActive ? 'status-active' : 'status-inactive'}`}>
          {event.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Meet type badge */}
      <div className="event-card-meet-type">
        {event.meetType === 'google_meet' && (
          <span className="meet-badge meet-badge--google">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.311a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
            </svg>
            Google Meet
            {event.meetUrl && <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 10 }}>· {event.meetUrl}</span>}
          </span>
        )}
        {event.meetType === 'phone' && (
          <span className="meet-badge meet-badge--phone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
            </svg>
            Phone Call
          </span>
        )}
        {event.meetType === 'offline' && (
          <span className="meet-badge meet-badge--offline">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            In-Person
          </span>
        )}
      </div>

      {event.description && (
        <p className="event-card-description">{event.description}</p>
      )}

      <div className="event-card-link" onClick={handleCopy}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {bookingUrl}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          {copied ? '✓ Copied' : 'Copy'}
        </span>
      </div>

      <div className="event-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(event.id)}>
          ✏️ Edit
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onToggle(event.id)}>
          {event.isActive ? '⏸ Disable' : '▶ Enable'}
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(event.id)}>
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

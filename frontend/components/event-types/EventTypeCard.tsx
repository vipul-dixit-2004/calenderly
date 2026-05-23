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

function getMeetLabel(meetType: string) {
  if (meetType === 'google_meet') return 'Google Meet';
  if (meetType === 'phone') return 'Phone Call';
  if (meetType === 'offline') return 'In-Person';
  return meetType;
}

function getMeetTypeLabel(meetType: string) {
  if (meetType === 'google_meet') return 'Group';
  return '1-on-1';
}

export default function EventTypeCard({ event, username, onToggle, onDelete, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}/${event.slug}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bookingUrl, '_blank');
  };

  return (
    <div className={`event-list-item ${!event.isActive ? 'event-list-item--inactive' : ''}`}>
      {/* Color accent bar */}
      <div className="event-list-accent" style={{ backgroundColor: event.color }} />

      {/* Checkbox area */}
      <div className="event-list-check">
        <input
          type="checkbox"
          className="event-checkbox"
          checked={event.isActive}
          onChange={() => onToggle(event.id)}
          id={`toggle-${event.id}`}
        />
      </div>

      {/* Main content */}
      <div className="event-list-body">
        <div className="event-list-title-row">
          <h3 className="event-list-title">{event.title}</h3>
        </div>
        <div className="event-list-meta">
          <span className="event-meta-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {event.duration} min
          </span>
          <span className="event-meta-sep">•</span>
          <span className="event-meta-chip">
            {getMeetLabel(event.meetType)}
          </span>
          <span className="event-meta-sep">•</span>
          <span className="event-meta-chip">
            {getMeetTypeLabel(event.meetType)}
          </span>
        </div>
        {event.description && (
          <p className="event-list-desc">{event.description}</p>
        )}
        <div className="event-list-days">
          Mon, Tue, Wed, Thu, Fri, Sat, hours vary
        </div>
      </div>

      {/* Actions */}
      <div className="event-list-actions">
        <button
          className="event-action-btn event-action-copy"
          onClick={handleCopy}
          title="Copy link"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>{copied ? '✓ Copied' : 'Copy link'}</span>
        </button>

        <button
          className="event-action-btn event-action-icon"
          onClick={handleShare}
          title="Open booking page"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>

        {/* More menu */}
        <div className="event-more-menu" style={{ position: 'relative' }}>
          <button
            className="event-action-btn event-action-icon"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            title="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="event-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="event-menu-dropdown">
                <button className="event-menu-item" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(event.id); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button className="event-menu-item" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onToggle(event.id); }}>
                  {event.isActive ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                      Disable
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Enable
                    </>
                  )}
                </button>
                <div className="event-menu-divider" />
                <button className="event-menu-item event-menu-item--danger" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(event.id); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

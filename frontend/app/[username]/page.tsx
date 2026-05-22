'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicEventTypes } from '@/lib/api';

interface PublicEventType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  description: string | null;
  color: string;
}

interface PublicUser {
  name: string;
  username: string;
  timezone: string;
}

interface ProfileData {
  user: PublicUser;
  eventTypes: PublicEventType[];
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await getPublicEventTypes(username);
        setData(result);
      } catch {
        setError('This user could not be found.');
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="booking-loading">
          <span className="spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="profile-page">
        <div className="booking-error-card">
          <div className="booking-error-icon">😕</div>
          <h2>User Not Found</h2>
          <p>{error || 'This profile does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  const { user, eventTypes } = data;

  return (
    <div className="profile-page">
      <head>
        <title>{user.name} – Book a Meeting | Calenderly</title>
        <meta name="description" content={`Schedule a meeting with ${user.name}. Choose from available event types.`} />
      </head>

      {/* Hero / user card */}
      <div className="profile-hero">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-handle">@{user.username}</p>
        <div className="profile-tz-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {user.timezone}
        </div>
      </div>

      {/* Event type list */}
      {eventTypes.length === 0 ? (
        <div className="profile-empty">
          <div className="profile-empty-icon">📭</div>
          <p className="profile-empty-text">No meetings available to book right now.</p>
        </div>
      ) : (
        <>
          <p className="profile-section-label">Available meeting types</p>
          <div className="profile-event-list">
            {eventTypes.map((evt) => (
              <Link
                key={evt.id}
                href={`/${username}/${evt.slug}`}
                className="profile-event-card"
                style={{ '--accent': evt.color } as React.CSSProperties}
                id={`event-${evt.slug}`}
              >
                <div className="profile-event-dot" style={{ background: evt.color }} />
                <div className="profile-event-body">
                  <div className="profile-event-title">{evt.title}</div>
                  {evt.description && (
                    <div className="profile-event-desc">{evt.description}</div>
                  )}
                  <div className="profile-event-meta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {evt.duration} min
                  </div>
                </div>
                <div className="profile-event-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <p className="booking-powered" style={{ marginTop: 40 }}>
        Powered by <strong>Calenderly</strong>
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMeetings, cancelMeeting } from '@/lib/api';
import MeetingCard from '@/components/meetings/MeetingCard';
import { useToast } from '@/components/ui/ToastProvider';

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

type TabType = 'upcoming' | 'past';

function groupByDate(meetings: Meeting[]): Record<string, Meeting[]> {
  const groups: Record<string, Meeting[]> = {};
  for (const m of meetings) {
    const d = new Date(m.startTime);
    const key = d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return groups;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { showToast } = useToast();

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMeetings(activeTab);
      setMeetings(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleCancel = async (id: string, reason: string) => {
    try {
      await cancelMeeting(id, reason);
      showToast('Meeting cancelled successfully');
      fetchMeetings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel meeting', 'error');
    }
  };

  const grouped = groupByDate(meetings);
  const dateKeys = Object.keys(grouped);
  const totalCount = meetings.length;

  return (
    <div className="meetings-page">
      {/* Page header */}
      <div className="meetings-page-header">
        <div className="meetings-title-row max-md:mb-3">
          <h1 className="meetings-title">Meetings</h1>
          <span className="meetings-info-icon" title="Meetings scheduled with you">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
        </div>

        {/* Event count */}
        {!loading && (
          <div className="meetings-count-label max-md:mb-3" style={{ marginBottom: 16 }}>
            Displaying {totalCount} Event{totalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Tabs bar */}
      <div className="meetings-tabs-bar">
        <div className="meetings-tabs max-md:gap-2">
          <button
            className={`meetings-tab max-md:px-4 max-md:py-2.5 max-md:text-sm ${activeTab === 'upcoming' ? 'meetings-tab--active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`meetings-tab max-md:px-4 max-md:py-2.5 max-md:text-sm ${activeTab === 'past' ? 'meetings-tab--active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="meetings-content">
        {loading ? (
          <div className="page-loading"><span className="spinner" /></div>
        ) : meetings.length === 0 ? (
          <div className="meetings-empty">
            <div className="meetings-empty-icon">🗓️</div>
            <div className="meetings-empty-title">No {activeTab} meetings</div>
            <div className="meetings-empty-desc">
              {activeTab === 'upcoming'
                ? 'When people book time with you, their meetings will show up here.'
                : 'You have no past meetings yet.'}
            </div>
          </div>
        ) : (
          <div className="meetings-list-wrap">
            {dateKeys.map(dateKey => (
              <div key={dateKey} className="meetings-date-group">
                <div className="meetings-date-label">{dateKey}</div>
                <div className="meetings-group-cards">
                  {grouped[dateKey].map(meeting => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="meetings-end-label">You've reached the end of the list</div>
          </div>
        )}
      </div>
    </div>
  );
}

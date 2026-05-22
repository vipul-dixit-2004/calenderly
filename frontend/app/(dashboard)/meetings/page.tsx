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

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Meetings</h2>
      </div>

      <div className="avail-tabs" style={{ marginBottom: 24 }}>
        <button 
          className={`avail-tab ${activeTab === 'upcoming' ? 'avail-tab--active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, display: 'inline', verticalAlign: 'text-bottom' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Upcoming
        </button>
        <button 
          className={`avail-tab ${activeTab === 'past' ? 'avail-tab--active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, display: 'inline', verticalAlign: 'text-bottom' }}>
            <path d="M3 3v5h5" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
          Past
        </button>
      </div>

      {loading ? (
        <div className="page-loading"><span className="spinner" /></div>
      ) : meetings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <div className="empty-state-title">No {activeTab} meetings</div>
          <div className="empty-state-desc">
            {activeTab === 'upcoming' 
              ? 'When people book time with you, their meetings will show up here.'
              : 'You have no past meetings yet.'}
          </div>
        </div>
      ) : (
        <div className="meeting-list">
          {meetings.map(meeting => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              onCancel={handleCancel} 
            />
          ))}
        </div>
      )}
    </>
  );
}

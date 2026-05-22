'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getEventTypes, createEventType, deleteEventType,
  toggleEventType, getMe, updateEventType,
} from '@/lib/api';
import EventTypeCard from '@/components/event-types/EventTypeCard';
import EventTypeForm from '@/components/event-types/EventTypeForm';
import { useToast } from '@/components/ui/ToastProvider';

interface EventType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  description: string | null;
  color: string;
  isActive: boolean;
  meetType: string;
  meetUrl: string | null;
}

interface User {
  username: string;
  name: string;
}

export default function EventTypesPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<EventType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'event-types' | 'single-use' | 'polls'>('event-types');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [evts, me] = await Promise.all([getEventTypes(), getMe()]);
      setEvents(evts);
      setUser(me);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (data: any) => {
    await createEventType(data);
    setShowForm(false);
    showToast('Event type created!');
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    if (!editEvent) return;
    await updateEventType(editEvent.id, data);
    setEditEvent(null);
    showToast('Event type updated!');
    fetchData();
  };

  const handleToggle = async (id: string) => {
    await toggleEventType(id);
    showToast('Event type toggled!');
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEventType(deleteId);
    setDeleteId(null);
    showToast('Event type deleted!', 'error');
    fetchData();
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="sched-page-header">
        <div className="sched-page-title-row">
          <h1 className="sched-page-title">
            Scheduling
            <button className="sched-info-btn" aria-label="Info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
          </h1>
          <button className="btn-create-top" onClick={() => setShowForm(true)}>
            <span>+</span> Create
          </button>
        </div>

        {/* Tabs */}
        <div className="sched-tabs">
          <button
            className={`sched-tab ${activeTab === 'event-types' ? 'sched-tab--active' : ''}`}
            onClick={() => setActiveTab('event-types')}
          >
            Event types
          </button>
          <button
            className={`sched-tab ${activeTab === 'single-use' ? 'sched-tab--active' : ''}`}
            onClick={() => setActiveTab('single-use')}
          >
            Single-use links
          </button>
          <button
            className={`sched-tab ${activeTab === 'polls' ? 'sched-tab--active' : ''}`}
            onClick={() => setActiveTab('polls')}
          >
            Meeting polls
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'event-types' && (
        <div className="sched-content">
          {/* Search bar */}
          <div className="sched-search-row">
            <div className="sched-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sched-search-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="sched-search-input"
                placeholder="Search event types"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredEvents.length === 0 && searchQuery === '' ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No event types yet</div>
              <div className="empty-state-desc">Create your first event type to start scheduling.</div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Create Event Type
              </button>
            </div>
          ) : (
            /* User section */
            <div className="sched-user-section">
              <div className="sched-user-header">
                <div className="sched-user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="sched-user-name">{user?.name || user?.username}</span>
                <div style={{ flex: 1 }} />
                <a
                  href={`/${user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sched-landing-link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  View landing page
                </a>
                <button className="sched-more-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    <circle cx="12" cy="19" r="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              {/* Event list */}
              <div className="event-list">
                {filteredEvents.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    No event types match your search.
                  </div>
                ) : (
                  filteredEvents.map(evt => (
                    <EventTypeCard
                      key={evt.id}
                      event={evt}
                      username={user?.username || ''}
                      onToggle={handleToggle}
                      onDelete={setDeleteId}
                      onEdit={(id) => {
                        const found = events.find(e => e.id === id);
                        if (found) setEditEvent(found);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'single-use' && (
        <div className="sched-content">
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <div className="empty-state-title">Single-use links coming soon</div>
            <div className="empty-state-desc">Generate one-time booking links for specific contacts.</div>
          </div>
        </div>
      )}

      {activeTab === 'polls' && (
        <div className="sched-content">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">Meeting polls coming soon</div>
            <div className="empty-state-desc">Let invitees vote on the best time to meet.</div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <EventTypeForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}

      {/* Edit Modal */}
      {editEvent && (
        <EventTypeForm
          initial={{ ...editEvent, description: editEvent.description || '', meetUrl: editEvent.meetUrl || '' }}
          onSubmit={handleUpdate}
          onClose={() => setEditEvent(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Event Type?</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                This will permanently remove this event type. Existing meetings will not be affected.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

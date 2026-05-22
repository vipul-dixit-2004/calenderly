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
}

export default function EventTypesPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<EventType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  if (loading) {
    return <div className="page-loading"><span className="spinner" /></div>;
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Event Types</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Event Type
        </button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">No event types yet</div>
          <div className="empty-state-desc">Create your first event type to start scheduling.</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Create Event Type
          </button>
        </div>
      ) : (
        <div className="event-grid">
          {events.map(evt => (
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
          ))}
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

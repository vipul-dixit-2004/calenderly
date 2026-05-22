'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

interface EventTypeData {
  title: string;
  slug: string;
  duration: number;
  description: string;
  color: string;
  meetType: string;
  meetUrl: string;
}

interface Props {
  initial?: EventTypeData & { id?: string };
  onSubmit: (data: EventTypeData) => Promise<void>;
  onClose: () => void;
}

const COLORS = ['#0069ff', '#7c3aed', '#059669', '#dc2626', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function EventTypeForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<EventTypeData>({
    title: initial?.title || '',
    slug: initial?.slug || '',
    duration: initial?.duration || 30,
    description: initial?.description || '',
    color: initial?.color || '#0069ff',
    meetType: (initial as EventTypeData & { id?: string })?.meetType || 'google_meet',
    meetUrl: (initial as EventTypeData & { id?: string })?.meetUrl || '',
  });
  const [slugManual, setSlugManual] = useState(!!initial?.slug);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!slugManual) {
      setForm(f => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugManual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    if (!form.slug.trim()) { showToast('Slug is required', 'error'); return; }
    if (form.duration < 5)  { showToast('Duration must be at least 5 minutes', 'error'); return; }

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initial?.id ? 'Edit Event Type' : 'New Event Type'}</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                className="form-input"
                placeholder="e.g. 30 Minute Meeting"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  className="form-input"
                  placeholder="30-minute-meeting"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); setForm(f => ({ ...f, slug: e.target.value })); }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <input
                  className="form-input"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 15 }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Brief description of this event..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-options">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${form.color === c ? 'color-swatch--selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Meeting Type</label>
              <div className="meet-type-options">
                {([
                  { value: 'google_meet', label: 'Google Meet', icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.311a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                    </svg>
                  )},
                  { value: 'phone', label: 'Phone Call', icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                    </svg>
                  )},
                  { value: 'offline', label: 'In-Person', icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  )},
                ] as { value: string; label: string; icon: React.ReactNode }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`meet-type-option ${form.meetType === opt.value ? 'meet-type-option--selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, meetType: opt.value, meetUrl: opt.value !== 'google_meet' ? '' : f.meetUrl }))}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.meetType === 'google_meet' && (
              <div className="form-group">
                <label className="form-label">Google Meet URL <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={form.meetUrl}
                  onChange={e => setForm(f => ({ ...f, meetUrl: e.target.value }))}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, display: 'block' }}>
                  Leave blank to auto-generate a link on each booking.
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (initial?.id ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '';

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

// ── Users ──
export const getMe = () => apiFetch('/users/me');
export const updateMe = (body: Record<string, unknown>) =>
  apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(body) });

// ── Event Types ──
export const getEventTypes = () => apiFetch('/event-types');
export const createEventType = (body: Record<string, unknown>) =>
  apiFetch('/event-types', { method: 'POST', body: JSON.stringify(body) });
export const getEventType = (id: string) => apiFetch(`/event-types/${id}`);
export const updateEventType = (id: string, body: Record<string, unknown>) =>
  apiFetch(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteEventType = (id: string) =>
  apiFetch(`/event-types/${id}`, { method: 'DELETE' });
export const toggleEventType = (id: string) =>
  apiFetch(`/event-types/${id}/toggle`, { method: 'PATCH' });

// ── Availability ──
export const getAvailability = () => apiFetch('/availability');
export const updateRules = (rules: Record<string, unknown>[]) =>
  apiFetch('/availability/rules', { method: 'PUT', body: JSON.stringify({ rules }) });
export const updateTimezone = (tz: string) =>
  apiFetch('/availability/timezone', { method: 'PUT', body: JSON.stringify({ timezone: tz }) });

// ── Meetings ──
export const getMeetings = (status = 'all') => apiFetch(`/meetings?status=${status}`);
export const getMeeting = (id: string) => apiFetch(`/meetings/${id}`);
export const cancelMeeting = (id: string, reason?: string) =>
  apiFetch(`/meetings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ cancelReason: reason }) });

// ── Booking (public — no x-user-id needed) ──
export const getPublicEventTypes = (username: string) =>
  apiFetch(`/bookings/${username}`);
export const getEventBySlug = (username: string, slug: string) =>
  apiFetch(`/bookings/${username}/${slug}`);
export const getSlots = (username: string, slug: string, date: string) =>
  apiFetch(`/bookings/${username}/${slug}/slots?date=${date}`);
export const createBooking = (username: string, slug: string, body: Record<string, unknown>) =>
  apiFetch(`/bookings/${username}/${slug}`, { method: 'POST', body: JSON.stringify(body) });

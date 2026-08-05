const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

// ── Auth ──
export const authSignup = (body: { name: string; email: string; username: string; password: string; timezone: string }) =>
  apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
export const authLogin = (body: { email: string; password: string }) =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const authLogout = () =>
  apiFetch('/auth/logout', { method: 'POST' });
export const authMe = () =>
  apiFetch('/auth/me');

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

// ── Booking (public — no auth needed) ──
export const getPublicEventTypes = (username: string) =>
  apiFetch(`/bookings/${username}`);
export const getEventBySlug = (username: string, slug: string) =>
  apiFetch(`/bookings/${username}/${slug}`);
export const getSlots = (username: string, slug: string, date: string, timezone: string) =>
  apiFetch(`/bookings/${username}/${slug}/slots?date=${date}&timezone=${encodeURIComponent(timezone)}`);
export const createBooking = (username: string, slug: string, body: Record<string, unknown>) =>
  apiFetch(`/bookings/${username}/${slug}`, { method: 'POST', body: JSON.stringify(body) });
export const getMeetingForReschedule = (id: string) =>
  apiFetch(`/bookings/reschedule/${id}`);
export const rescheduleBooking = (id: string, body: Record<string, unknown>) =>
  apiFetch(`/bookings/reschedule/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

// ── AI Assistant ──
export const aiChat = (
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
) =>
  apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });

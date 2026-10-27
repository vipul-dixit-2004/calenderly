import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

import { api } from '@/lib/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// React Native has no window focus event; refetch stale data when the app returns to foreground
AppState.addEventListener('change', (status) => {
  if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
});

export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed';

// Shape returned by GET /meetings (backend/src/controllers/meetingController.js)
export type Meeting = {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  cancelReason: string | null;
  createdAt: string;
  eventTitle: string;
  duration: number;
  color: string | null;
  slug: string;
};

export type EventType = {
  id: string;
  title: string;
  slug: string;
  duration: number;
  description: string | null;
  meetType: 'google_meet' | 'offline' | 'phone';
  color: string | null;
  meetUrl: string | null;
  isActive: boolean;
};

// Body accepted by POST/PUT /event-types (backend/src/controllers/eventTypeController.js)
export type EventTypeInput = {
  title: string;
  slug: string;
  duration: number;
  description: string;
  color: string;
  meetType: EventType['meetType'];
  meetUrl: string;
};

export const createEventType = (input: EventTypeInput) =>
  api<EventType>('/event-types', { method: 'POST', body: JSON.stringify(input) });

export const updateEventType = ({ id, ...input }: EventTypeInput & { id: string }) =>
  api<EventType>(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const toggleEventType = (id: string) =>
  api<EventType>(`/event-types/${id}/toggle`, { method: 'PATCH' });

export const deleteEventType = (id: string) =>
  api<void>(`/event-types/${id}`, { method: 'DELETE' });

// GET /availability (backend/src/controllers/availabilityController.js).
// Times come from Postgres `time` columns as "HH:mm:ss".
export type AvailabilityRule = { dayOfWeek: number; startTime: string; endTime: string };
export type Availability = {
  schedule: { id: string; name: string; timezone: string; isDefault: boolean };
  rules: AvailabilityRule[];
};

// Replaces every weekly rule on the default schedule
export const saveAvailabilityRules = (rules: AvailabilityRule[]) =>
  api<AvailabilityRule[]>('/availability/rules', { method: 'PUT', body: JSON.stringify({ rules }) });

export const saveAvailabilityTimezone = (timezone: string) =>
  api<Availability['schedule']>('/availability/timezone', {
    method: 'PUT',
    body: JSON.stringify({ timezone }),
  });

export type MeetingFilter = 'upcoming' | 'past';

export const queries = {
  meetings: (status: MeetingFilter) => ({
    queryKey: ['meetings', status],
    queryFn: () => api<Meeting[]>(`/meetings?status=${status}`),
  }),
  eventTypes: {
    queryKey: ['event-types'],
    queryFn: () => api<EventType[]>('/event-types'),
  },
  availability: {
    queryKey: ['availability'],
    queryFn: () => api<Availability>('/availability'),
  },
};

export type ChatMessage = { role: 'user' | 'model'; content: string };

// POST /ai/chat runs the Gemini agent; `history` is the conversation before `message`
export const aiChat = (message: string, history: ChatMessage[]) =>
  api<{ reply: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });

export const cancelMeeting =({ id, reason }: { id: string; reason: string }) =>
  api<Meeting>(`/meetings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelReason: reason.trim() || undefined }),
  });

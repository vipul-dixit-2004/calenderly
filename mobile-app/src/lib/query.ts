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
  isActive: boolean;
};

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
};

export const cancelMeeting = ({ id, reason }: { id: string; reason: string }) =>
  api<Meeting>(`/meetings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelReason: reason.trim() || undefined }),
  });

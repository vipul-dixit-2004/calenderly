import { useQuery } from '@tanstack/react-query';
import {
  addDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  startOfDay,
} from 'date-fns';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BRAND } from '@/components/auth-form';
import { formatTimeRange, MeetingCard } from '@/components/meeting-card';
import { ThemedText } from '@/components/themed-text';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { WEB_HOST } from '@/lib/config';
import { queries, type EventType, type Meeting } from '@/lib/query';

const MAX_UPCOMING = 10;

const MEET_TYPE_LABELS: Record<EventType['meetType'], string> = {
  google_meet: 'Google Meet',
  offline: 'In person',
  phone: 'Phone',
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function dayLabel(date: Date) {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d');
}

// Group meetings (already sorted by start time) under their day label
function groupByDay(meetings: Meeting[]) {
  const groups: { label: string; meetings: Meeting[] }[] = [];
  for (const m of meetings) {
    const label = dayLabel(new Date(m.startTime));
    const last = groups.at(-1);
    if (last?.label === label) last.meetings.push(m);
    else groups.push({ label, meetings: [m] });
  }
  return groups;
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const meetingsQuery = useQuery(queries.meetings('upcoming'));
  const eventTypesQuery = useQuery(queries.eventTypes);

  const isLoading = meetingsQuery.isPending || eventTypesQuery.isPending;
  const error = meetingsQuery.error ?? eventTypesQuery.error;
  const isRefreshing = meetingsQuery.isRefetching || eventTypesQuery.isRefetching;

  const refresh = () => {
    meetingsQuery.refetch();
    eventTypesQuery.refetch();
  };

  // Backend orders by creation date; the dashboard wants soonest first
  const upcoming = [...(meetingsQuery.data ?? [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const weekEnd = addDays(startOfDay(new Date()), 7);
  const todayCount = upcoming.filter((m) => isToday(new Date(m.startTime))).length;
  const weekCount = upcoming.filter((m) => new Date(m.startTime) < weekEnd).length;
  const eventTypes = eventTypesQuery.data ?? [];
  const activeEventTypes = eventTypes.filter((e) => e.isActive).length;

  const [next, ...rest] = upcoming;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText type="small" themeColor="textSecondary">
                {format(new Date(), 'EEEE, MMMM d')}
              </ThemedText>
              <ThemedText style={styles.greeting}>
                {greeting()}, {user?.name.split(' ')[0]}
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              <ThemeToggle />
              <Pressable onPress={signOut} hitSlop={8}>
                <ThemedText type="small" themeColor="textSecondary">
                  Sign out
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : error ? (
            <ErrorState message={error.message} onRetry={refresh} />
          ) : (
            <>
              <View style={styles.stats}>
                <StatTile value={todayCount} label="Today" />
                <StatTile value={weekCount} label="Next 7 days" />
                <StatTile value={activeEventTypes} label="Active events" />
              </View>

              {next ? (
                <NextMeeting meeting={next} />
              ) : (
                <EmptyState username={user?.username} />
              )}

              {rest.length > 0 && (
                <Section title="Upcoming">
                  {groupByDay(rest.slice(0, MAX_UPCOMING)).map((group) => (
                    <View key={group.label} style={styles.dayGroup}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {group.label}
                      </ThemedText>
                      {group.meetings.map((m) => (
                        <MeetingCard key={m.id} meeting={m} />
                      ))}
                    </View>
                  ))}
                  {rest.length > MAX_UPCOMING && (
                    <ThemedText type="small" themeColor="textSecondary">
                      +{rest.length - MAX_UPCOMING} more
                    </ThemedText>
                  )}
                </Section>
              )}

              <Section title="Your event types">
                {eventTypes.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    No event types yet. Create one on the web app.
                  </ThemedText>
                ) : (
                  eventTypes.map((e) => <EventTypeRow key={e.id} eventType={e} />)
                )}
              </Section>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statTile, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

function NextMeeting({ meeting }: { meeting: Meeting }) {
  const start = new Date(meeting.startTime);
  return (
    <View style={[styles.nextCard, { backgroundColor: meeting.color ?? BRAND }]}>
      <ThemedText type="smallBold" style={styles.nextLabel}>
        NEXT MEETING · IN {formatDistanceToNowStrict(start).toUpperCase()}
      </ThemedText>
      <ThemedText style={styles.nextTitle} numberOfLines={2}>
        {meeting.eventTitle}
      </ThemedText>
      <ThemedText style={styles.nextText}>with {meeting.inviteeName}</ThemedText>
      <ThemedText style={styles.nextText}>
        {dayLabel(start)} · {formatTimeRange(meeting)}
      </ThemedText>
    </View>
  );
}

function EventTypeRow({ eventType }: { eventType: EventType }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.eventRow,
        { backgroundColor: theme.backgroundElement, opacity: eventType.isActive ? 1 : 0.6 },
      ]}>
      <View style={[styles.dot, { backgroundColor: eventType.color ?? BRAND }]} />
      <View style={styles.eventText}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {eventType.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {eventType.duration} min · {MEET_TYPE_LABELS[eventType.meetType] ?? eventType.meetType}
        </ThemedText>
      </View>
      {!eventType.isActive && (
        <ThemedText type="small" themeColor="textSecondary">
          Off
        </ThemedText>
      )}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function EmptyState({ username }: { username?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.emptyCard, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold">No upcoming meetings</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Share your booking link to get some on the calendar:
      </ThemedText>
      <ThemedText type="small" style={{ color: BRAND }}>
        {WEB_HOST}/{username}
      </ThemedText>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorState}>
      <ThemedText type="smallBold">Couldn&apos;t load your dashboard</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        {message}
      </ThemedText>
      <Pressable onPress={onRetry} hitSlop={8}>
        <ThemedText type="linkPrimary">Try again</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  greeting: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  loader: {
    marginTop: Spacing.six,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  nextCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  nextLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  nextTitle: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
  nextText: {
    color: '#ffffff',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 16,
  },
  dayGroup: {
    gap: Spacing.two,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventText: {
    flex: 1,
    gap: Spacing.half,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  errorState: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
});

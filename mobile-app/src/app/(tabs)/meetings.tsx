import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DANGER } from '@/components/auth-form';
import { CancelMeetingModal } from '@/components/cancel-meeting-modal';
import { MeetingCard } from '@/components/meeting-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WEB_URL } from '@/lib/config';
import { queries, type Meeting, type MeetingFilter } from '@/lib/query';

const TABS: { key: MeetingFilter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

// Upcoming: soonest first. Past: most recent first.
function groupByDate(meetings: Meeting[], filter: MeetingFilter) {
  const sorted = [...meetings].sort((a, b) => {
    const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    return filter === 'upcoming' ? diff : -diff;
  });
  const sections: { title: string; data: Meeting[] }[] = [];
  for (const m of sorted) {
    const title = format(new Date(m.startTime), 'EEEE, d MMMM yyyy');
    const last = sections.at(-1);
    if (last?.title === title) last.data.push(m);
    else sections.push({ title, data: [m] });
  }
  return sections;
}

export default function MeetingsScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<MeetingFilter>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Meeting | null>(null);
  const { data, isPending, error, refetch, isRefetching } = useQuery(queries.meetings(filter));

  const meetings = data ?? [];
  const sections = groupByDate(meetings, filter);

  const switchTab = (key: MeetingFilter) => {
    setFilter(key);
    setExpandedId(null);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Meetings</ThemedText>
          {!isPending && !error && (
            <ThemedText type="small" themeColor="textSecondary">
              Displaying {meetings.length} Event{meetings.length !== 1 ? 's' : ''}
            </ThemedText>
          )}
        </View>

        <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
          {TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => switchTab(tab.key)}
                style={[styles.segment, active && { backgroundColor: theme.background }]}>
                <ThemedText type="smallBold" themeColor={active ? 'text' : 'textSecondary'}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {isPending ? (
          <ActivityIndicator style={styles.loader} />
        ) : error ? (
          <View style={styles.message}>
            <ThemedText type="smallBold">Failed to load meetings</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              {error.message}
            </ThemedText>
            <Pressable onPress={() => refetch()} hitSlop={8}>
              <ThemedText type="linkPrimary">Try again</ThemedText>
            </Pressable>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
            renderSectionHeader={({ section }) => (
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHeader}>
                {section.title}
              </ThemedText>
            )}
            renderItem={({ item }) => (
              <MeetingCard
                meeting={item}
                onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                {expandedId === item.id && (
                  <MeetingDetails meeting={item} onCancel={() => setCancelling(item)} />
                )}
              </MeetingCard>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.message}>
                <ThemedText style={styles.emptyIcon}>🗓️</ThemedText>
                <ThemedText type="smallBold">No {filter} meetings</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                  {filter === 'upcoming'
                    ? 'When people book time with you, their meetings will show up here.'
                    : 'You have no past meetings yet.'}
                </ThemedText>
              </View>
            }
            ListFooterComponent={
              meetings.length > 0 ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.endLabel}>
                  You&apos;ve reached the end of the list
                </ThemedText>
              ) : undefined
            }
          />
        )}
      </SafeAreaView>

      <CancelMeetingModal meeting={cancelling} onClose={() => setCancelling(null)} />
    </ThemedView>
  );
}

function MeetingDetails({ meeting, onCancel }: { meeting: Meeting; onCancel: () => void }) {
  const theme = useTheme();
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
  const canChange = meeting.status === 'scheduled' && new Date(meeting.startTime) > new Date();

  return (
    <View style={[styles.details, { borderTopColor: theme.backgroundSelected }]}>
      <DetailRow label="Invitee" value={meeting.inviteeName} />
      <DetailRow label="Email" value={meeting.inviteeEmail} />
      <DetailRow label="Duration" value={`${meeting.duration} minutes`} />
      <DetailRow label="Timezone" value={tzName} />
      {meeting.status === 'cancelled' && meeting.cancelReason && (
        <DetailRow label="Cancel reason" value={meeting.cancelReason} danger />
      )}

      {canChange && (
        <View style={styles.detailActions}>
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/reschedule/${meeting.id}`)}
            style={[styles.actionButton, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold">Reschedule</ThemedText>
          </Pressable>
          <Pressable onPress={onCancel} style={[styles.actionButton, styles.dangerButton]}>
            <ThemedText type="smallBold" style={styles.dangerText}>
              Cancel Meeting
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={[styles.detailValue, danger && { color: DANGER }]}>
        {value}
      </ThemedText>
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
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.half,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.one,
    borderRadius: Spacing.three,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  loader: {
    marginTop: Spacing.six,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    flexGrow: 1,
  },
  sectionHeader: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  separator: {
    height: Spacing.two,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    fontSize: 40,
    lineHeight: 48,
  },
  center: {
    textAlign: 'center',
  },
  endLabel: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  details: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.one,
  },
  detailRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  detailLabel: {
    width: 100,
  },
  detailValue: {
    flex: 1,
  },
  detailActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: DANGER,
  },
  dangerText: {
    color: '#ffffff',
  },
});

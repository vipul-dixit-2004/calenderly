import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BRAND, DANGER } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Meeting } from '@/lib/query';

export const formatTimeRange = (m: Meeting) =>
  `${format(new Date(m.startTime), 'h:mm a')} – ${format(new Date(m.endTime), 'h:mm a')}`;

/**
 * Meeting summary row. Pass `onPress` to make it tappable and `children`
 * to render extra content (e.g. expanded details) below the summary.
 */
export function MeetingCard({
  meeting,
  onPress,
  children,
}: {
  meeting: Meeting;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const theme = useTheme();
  const cancelled = meeting.status === 'cancelled';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.colorBar, { backgroundColor: meeting.color ?? BRAND }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={cancelled && styles.strike}>
            {formatTimeRange(meeting)}
          </ThemedText>
          {cancelled && (
            <ThemedText type="smallBold" style={styles.cancelledBadge}>
              Cancelled
            </ThemedText>
          )}
        </View>
        <ThemedText type="smallBold" numberOfLines={1}>
          {meeting.eventTitle}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          with {meeting.inviteeName}
        </ThemedText>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  cancelledBadge: {
    color: DANGER,
    fontSize: 12,
  },
});

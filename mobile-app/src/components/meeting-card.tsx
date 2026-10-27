import { format } from 'date-fns';
import { StyleSheet, View } from 'react-native';

import { BRAND } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Meeting } from '@/lib/query';

export const formatTimeRange = (m: Meeting) =>
  `${format(new Date(m.startTime), 'h:mm a')} – ${format(new Date(m.endTime), 'h:mm a')}`;

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.colorBar, { backgroundColor: meeting.color ?? BRAND }]} />
      <View style={styles.body}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatTimeRange(meeting)}
        </ThemedText>
        <ThemedText type="smallBold" numberOfLines={1}>
          {meeting.eventTitle}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          with {meeting.inviteeName}
        </ThemedText>
      </View>
    </View>
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
});

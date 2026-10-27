import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Switch, View } from 'react-native';

import { BRAND } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { EventType } from '@/lib/query';

export const MEET_TYPE_LABELS: Record<EventType['meetType'], string> = {
  google_meet: 'Google Meet',
  phone: 'Phone Call',
  offline: 'In-Person',
};

export function EventTypeCard({
  eventType,
  bookingUrl,
  onToggle,
  onMore,
}: {
  eventType: EventType;
  bookingUrl: string;
  onToggle: () => void;
  onMore: () => void;
}) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = async () => {
    await Clipboard.setStringAsync(bookingUrl);
    setCopied(true);
  };

  const shareLink = () =>
    Share.share({ message: `Book a ${eventType.title} with me: ${bookingUrl}` });

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, opacity: eventType.isActive ? 1 : 0.6 },
      ]}>
      <View style={[styles.accent, { backgroundColor: eventType.color ?? BRAND }]} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <ThemedText type="smallBold" style={styles.title} numberOfLines={2}>
              {eventType.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {eventType.duration} min • {MEET_TYPE_LABELS[eventType.meetType] ?? eventType.meetType}
            </ThemedText>
          </View>
          <Switch
            value={eventType.isActive}
            onValueChange={onToggle}
            trackColor={{ true: BRAND }}
            accessibilityLabel={eventType.isActive ? 'Disable event type' : 'Enable event type'}
          />
        </View>

        {eventType.description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {eventType.description}
          </ThemedText>
        ) : null}

        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          /{eventType.slug}
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            onPress={copyLink}
            style={({ pressed }) => [
              styles.actionButton,
              { borderColor: BRAND, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: BRAND }}>
              {copied ? '✓ Copied' : 'Copy link'}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={shareLink}
            style={({ pressed }) => [
              styles.actionButton,
              { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold">Share</ThemedText>
          </Pressable>
          <Pressable
            onPress={onMore}
            hitSlop={8}
            accessibilityLabel="More options"
            style={({ pressed }) => [
              styles.moreButton,
              { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold">⋯</ThemedText>
          </Pressable>
        </View>
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
  accent: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleText: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 44,
    height: 36,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

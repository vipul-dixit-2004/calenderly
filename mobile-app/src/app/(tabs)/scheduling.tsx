import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionSheet } from '@/components/action-sheet';
import { BRAND } from '@/components/auth-form';
import { EventTypeCard } from '@/components/event-type-card';
import { EventTypeForm } from '@/components/event-type-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { WEB_URL } from '@/lib/config';
import { deleteEventType, queries, toggleEventType, type EventType } from '@/lib/query';

export default function SchedulingScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  // undefined = form closed, null = creating, EventType = editing
  const [formTarget, setFormTarget] = useState<EventType | null | undefined>(undefined);
  const [menuTarget, setMenuTarget] = useState<EventType | null>(null);
  const { data, isPending, error, refetch, isRefetching } = useQuery(queries.eventTypes);

  const toggle = useMutation({
    mutationFn: toggleEventType,
    // Flip the switch immediately; roll back if the request fails
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['event-types'] });
      const previous = queryClient.getQueryData<EventType[]>(['event-types']);
      queryClient.setQueryData<EventType[]>(['event-types'], (old) =>
        old?.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(['event-types'], context?.previous);
      Alert.alert("Couldn't update event type", err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['event-types'] }),
  });

  const remove = useMutation({
    mutationFn: deleteEventType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
      // Deleting an event type cascades to its meetings
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (err) => Alert.alert("Couldn't delete event type", err.message),
  });

  const confirmDelete = (eventType: EventType) =>
    Alert.alert(
      'Delete Event Type?',
      `This permanently removes "${eventType.title}" and every meeting booked with it, including upcoming ones. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(eventType.id) },
      ]
    );

  const eventTypes = data ?? [];
  const filtered = eventTypes.filter((e) =>
    e.title.toLowerCase().includes(search.trim().toLowerCase())
  );
  const bookingUrl = (e: EventType) => `${WEB_URL}/${user?.username}/${e.slug}`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Scheduling</ThemedText>
          <Pressable
            onPress={() => setFormTarget(null)}
            style={({ pressed }) => [styles.createButton, { opacity: pressed ? 0.8 : 1 }]}>
            <ThemedText type="smallBold" style={styles.createText}>
              + Create
            </ThemedText>
          </Pressable>
        </View>

        {isPending ? (
          <ActivityIndicator style={styles.loader} />
        ) : error ? (
          <Message icon="⚠️" title="Failed to load event types" text={error.message}>
            <Pressable onPress={() => refetch()} hitSlop={8}>
              <ThemedText type="linkPrimary">Try again</ThemedText>
            </Pressable>
          </Message>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(e) => e.id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
            }
            ListHeaderComponent={
              eventTypes.length > 0 ? (
                <View style={styles.listHeader}>
                  <TextInput
                    style={[
                      styles.search,
                      { backgroundColor: theme.backgroundElement, color: theme.text },
                    ]}
                    placeholder="Search event types"
                    placeholderTextColor={theme.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    clearButtonMode="while-editing"
                  />
                  <View style={styles.userRow}>
                    <View style={[styles.avatar, { backgroundColor: BRAND }]}>
                      <ThemedText type="smallBold" style={styles.avatarText}>
                        {user?.name.charAt(0).toUpperCase() || 'U'}
                      </ThemedText>
                    </View>
                    <ThemedText type="smallBold" style={styles.flex} numberOfLines={1}>
                      {user?.name || user?.username}
                    </ThemedText>
                    <Pressable
                      onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/${user?.username}`)}
                      hitSlop={8}>
                      <ThemedText type="small" style={{ color: BRAND }}>
                        View landing page ↗
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              ) : undefined
            }
            renderItem={({ item }) => (
              <EventTypeCard
                eventType={item}
                bookingUrl={bookingUrl(item)}
                onToggle={() => toggle.mutate(item.id)}
                onMore={() => setMenuTarget(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              eventTypes.length === 0 ? (
                <Message
                  icon="📅"
                  title="No event types yet"
                  text="Create your first event type to start scheduling.">
                  <Pressable
                    onPress={() => setFormTarget(null)}
                    style={[styles.createButton, styles.emptyCreate]}>
                    <ThemedText type="smallBold" style={styles.createText}>
                      + Create Event Type
                    </ThemedText>
                  </Pressable>
                </Message>
              ) : (
                <ThemedText type="small" themeColor="textSecondary" style={styles.noMatch}>
                  No event types match your search.
                </ThemedText>
              )
            }
          />
        )}
      </SafeAreaView>

      <ActionSheet
        visible={!!menuTarget}
        title={menuTarget?.title}
        onClose={() => setMenuTarget(null)}
        options={
          menuTarget
            ? [
                { label: 'Edit', onPress: () => setFormTarget(menuTarget) },
                {
                  label: menuTarget.isActive ? 'Disable' : 'Enable',
                  onPress: () => toggle.mutate(menuTarget.id),
                },
                { label: 'Delete', destructive: true, onPress: () => confirmDelete(menuTarget) },
              ]
            : []
        }
      />

      {formTarget !== undefined && (
        <EventTypeForm
          initial={formTarget ?? undefined}
          onClose={() => setFormTarget(undefined)}
        />
      )}
    </ThemedView>
  );
}

function Message({
  icon,
  title,
  text,
  children,
}: {
  icon: string;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.message}>
      <ThemedText style={styles.messageIcon}>{icon}</ThemedText>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        {text}
      </ThemedText>
      {children}
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  createButton: {
    backgroundColor: BRAND,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  createText: {
    color: '#ffffff',
  },
  loader: {
    marginTop: Spacing.six,
  },
  list: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    flexGrow: 1,
  },
  listHeader: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  search: {
    height: 44,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
  },
  separator: {
    height: Spacing.three,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  messageIcon: {
    fontSize: 40,
    lineHeight: 48,
  },
  center: {
    textAlign: 'center',
  },
  emptyCreate: {
    marginTop: Spacing.two,
  },
  noMatch: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
});

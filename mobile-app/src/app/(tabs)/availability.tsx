import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton, AuthError, BRAND, DANGER } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatTime, TimePickerSheet } from '@/components/time-picker-sheet';
import { TimezonePicker } from '@/components/timezone-picker';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  queries,
  saveAvailabilityRules,
  saveAvailabilityTimezone,
  type AvailabilityRule,
} from '@/lib/query';

type Slot = { startTime: string; endTime: string };
type Day = { dayOfWeek: number; enabled: boolean; slots: Slot[] };
type Section = 'weekly' | 'settings';
type PickerTarget = { day: number; slot: number; field: keyof Slot };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_SLOT: Slot = { startTime: '09:00', endTime: '17:00' };

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

function calcDuration(start: string, end: string) {
  const mins = toMinutes(end) - toMinutes(start);
  if (mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

// Days with saved rules are on; the rest are off with a 9–5 slot ready if re-enabled
function daysFromRules(rules: AvailabilityRule[]): Day[] {
  return DAYS.map((_, dayOfWeek) => {
    const slots = rules
      .filter((r) => r.dayOfWeek === dayOfWeek)
      .map((r) => ({ startTime: r.startTime.slice(0, 5), endTime: r.endTime.slice(0, 5) }))
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    return slots.length > 0
      ? { dayOfWeek, enabled: true, slots }
      : { dayOfWeek, enabled: false, slots: [DEFAULT_SLOT] };
  });
}

function validate(days: Day[]): string | null {
  for (const day of days) {
    if (!day.enabled) continue;
    const sorted = [...day.slots].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      const { startTime, endTime } = sorted[i];
      if (toMinutes(endTime) <= toMinutes(startTime)) {
        return `${DAYS[day.dayOfWeek]}: ${formatTime(endTime)} is not after ${formatTime(startTime)}.`;
      }
      if (i > 0 && toMinutes(startTime) < toMinutes(sorted[i - 1].endTime)) {
        return `${DAYS[day.dayOfWeek]}: time slots overlap.`;
      }
    }
  }
  return null;
}

const applyPreset = (days: Day[], isOn: (dayOfWeek: number) => boolean): Day[] =>
  days.map((d) => ({ ...d, enabled: isOn(d.dayOfWeek), slots: [DEFAULT_SLOT] }));

export default function AvailabilityScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data, isPending, error, refetch, isRefetching } = useQuery(queries.availability);

  // Unsaved edits; null means "show what the server has"
  const [draftDays, setDraftDays] = useState<Day[] | null>(null);
  const [draftTimezone, setDraftTimezone] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('weekly');
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const serverDays = data ? daysFromRules(data.rules) : [];
  const days = draftDays ?? serverDays;
  const isDirty = draftDays !== null && JSON.stringify(draftDays) !== JSON.stringify(serverDays);
  const savedTimezone = data?.schedule.timezone ?? '';
  const timezone = draftTimezone ?? savedTimezone;

  const saveRules = useMutation({
    mutationFn: saveAvailabilityRules,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['availability'] });
      setDraftDays(null);
    },
  });

  const saveTimezone = useMutation({
    mutationFn: saveAvailabilityTimezone,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['availability'] });
      setDraftTimezone(null);
    },
  });

  const editDays = (update: (days: Day[]) => Day[]) => {
    setValidationError(null);
    saveRules.reset();
    setDraftDays(update(days));
  };

  const updateDay = (index: number, update: (day: Day) => Day) =>
    editDays((all) => all.map((d, i) => (i === index ? update(d) : d)));

  const addSlot = (index: number) =>
    updateDay(index, (day) => {
      // New slot starts where the last one ends and runs two hours
      const start = day.slots.at(-1)?.endTime ?? '13:00';
      const end = fromMinutes(Math.min(toMinutes(start) + 120, 23 * 60 + 59));
      return { ...day, slots: [...day.slots, { startTime: start, endTime: end }] };
    });

  const handleSaveRules = () => {
    const problem = validate(days);
    if (problem) return setValidationError(problem);
    saveRules.mutate(
      days.flatMap((d) =>
        d.enabled ? d.slots.map((s) => ({ dayOfWeek: d.dayOfWeek, ...s })) : []
      )
    );
  };

  const enabledCount = days.filter((d) => d.enabled).length;
  const totalSlots = days.reduce((sum, d) => sum + (d.enabled ? d.slots.length : 0), 0);
  const rulesError = validationError ?? saveRules.error?.message ?? null;
  const pickerSlot = picker ? days[picker.day]?.slots[picker.slot] : undefined;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {isPending ? (
          <ActivityIndicator style={styles.loader} />
        ) : error ? (
          <View style={styles.message}>
            <ThemedText type="smallBold">Failed to load availability</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              {error.message}
            </ThemedText>
            <Pressable onPress={() => refetch()} hitSlop={8}>
              <ThemedText type="linkPrimary">Try again</ThemedText>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => void refetch()}
                // Pulling would silently keep stale drafts on top of fresh data
                enabled={!isDirty && draftTimezone === null}
              />
            }>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Availability</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Set when you&apos;re available for meetings each week
              </ThemedText>
            </View>

            <View style={styles.stats}>
              <Stat value={String(enabledCount)} label="Days available" />
              <Stat value={String(totalSlots)} label="Time slots" />
              <Stat
                value={savedTimezone.split('/').pop()?.replace(/_/g, ' ') ?? savedTimezone}
                label="Timezone"
                small
              />
            </View>

            <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
              {(
                [
                  ['weekly', 'Weekly Hours'],
                  ['settings', 'Timezone & Settings'],
                ] as const
              ).map(([key, label]) => {
                const active = section === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSection(key)}
                    style={[styles.segment, active && { backgroundColor: theme.background }]}>
                    <ThemedText type="smallBold" themeColor={active ? 'text' : 'textSecondary'}>
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {section === 'weekly' ? (
              <>
                <View style={styles.presets}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Quick set:
                  </ThemedText>
                  <Preset label="Mon – Fri" onPress={() => editDays((d) => applyPreset(d, (n) => n >= 1 && n <= 5))} />
                  <Preset label="Mon – Sat" onPress={() => editDays((d) => applyPreset(d, (n) => n >= 1))} />
                  <Preset label="All Week" onPress={() => editDays((d) => applyPreset(d, () => true))} />
                  <Preset
                    label="Clear All"
                    danger
                    onPress={() => editDays((all) => all.map((d) => ({ ...d, enabled: false })))}
                  />
                </View>

                <View style={styles.days}>
                  {days.map((day, dayIndex) => (
                    <View
                      key={day.dayOfWeek}
                      style={[styles.dayCard, { backgroundColor: theme.backgroundElement }]}>
                      <View style={styles.dayHeader}>
                        <ThemedText
                          type="smallBold"
                          themeColor={day.enabled ? 'text' : 'textSecondary'}>
                          {DAYS[day.dayOfWeek]}
                        </ThemedText>
                        <Switch
                          value={day.enabled}
                          onValueChange={(enabled) => updateDay(dayIndex, (d) => ({ ...d, enabled }))}
                          trackColor={{ true: BRAND }}
                          accessibilityLabel={`${DAYS[day.dayOfWeek]} available`}
                        />
                      </View>

                      {day.enabled ? (
                        <>
                          {day.slots.map((slot, slotIndex) => (
                            <View key={slotIndex} style={styles.slotRow}>
                              <TimeButton
                                value={slot.startTime}
                                onPress={() =>
                                  setPicker({ day: dayIndex, slot: slotIndex, field: 'startTime' })
                                }
                              />
                              <ThemedText type="small" themeColor="textSecondary">
                                →
                              </ThemedText>
                              <TimeButton
                                value={slot.endTime}
                                onPress={() =>
                                  setPicker({ day: dayIndex, slot: slotIndex, field: 'endTime' })
                                }
                              />
                              <ThemedText
                                type="small"
                                themeColor="textSecondary"
                                style={styles.duration}>
                                {calcDuration(slot.startTime, slot.endTime)}
                              </ThemedText>
                              {day.slots.length > 1 && (
                                <Pressable
                                  onPress={() =>
                                    updateDay(dayIndex, (d) => ({
                                      ...d,
                                      slots: d.slots.filter((_, i) => i !== slotIndex),
                                    }))
                                  }
                                  hitSlop={8}
                                  accessibilityLabel="Remove time slot">
                                  <ThemedText themeColor="textSecondary">✕</ThemedText>
                                </Pressable>
                              )}
                            </View>
                          ))}
                          <Pressable onPress={() => addSlot(dayIndex)} hitSlop={8}>
                            <ThemedText type="small" style={{ color: BRAND }}>
                              + Add time slot
                            </ThemedText>
                          </Pressable>
                        </>
                      ) : (
                        <ThemedText type="small" themeColor="textSecondary">
                          Unavailable
                        </ThemedText>
                      )}
                    </View>
                  ))}
                </View>

                <AuthError message={rulesError} />
                <AuthButton
                  title={isDirty ? 'Save Weekly Schedule' : 'All changes saved'}
                  onPress={handleSaveRules}
                  disabled={!isDirty}
                  loading={saveRules.isPending}
                />
                <View style={styles.footer}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {enabledCount} of 7 days enabled · {totalSlots} time slot
                    {totalSlots !== 1 ? 's' : ''}
                  </ThemedText>
                  {isDirty && (
                    <Pressable
                      onPress={() => {
                        setDraftDays(null);
                        setValidationError(null);
                      }}
                      hitSlop={8}>
                      <ThemedText type="small" themeColor="textSecondary">
                        Discard changes
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.settings}>
                <View style={styles.field}>
                  <TimezonePicker value={timezone} onChange={setDraftTimezone} />
                  <ThemedText type="small" themeColor="textSecondary">
                    Invitees will see available slots converted to their local timezone
                    automatically.
                  </ThemedText>
                </View>

                {data && (
                  <View style={styles.field}>
                    <ThemedText type="smallBold">Schedule Name</ThemedText>
                    <View style={[styles.infoRow, { backgroundColor: theme.backgroundElement }]}>
                      <ThemedText>{data.schedule.name}</ThemedText>
                      {data.schedule.isDefault && (
                        <ThemedText type="smallBold" style={styles.defaultBadge}>
                          Default
                        </ThemedText>
                      )}
                    </View>
                  </View>
                )}

                <View style={[styles.clockCard, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Current time in selected timezone
                  </ThemedText>
                  <CurrentTime timezone={timezone} />
                </View>

                <AuthError message={saveTimezone.error?.message ?? null} />
                <AuthButton
                  title={timezone !== savedTimezone ? 'Save Timezone' : 'Timezone saved'}
                  onPress={() => saveTimezone.mutate(timezone)}
                  disabled={timezone === savedTimezone}
                  loading={saveTimezone.isPending}
                />
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      <TimePickerSheet
        visible={!!pickerSlot}
        title={
          picker
            ? `${DAYS[days[picker.day].dayOfWeek]} · ${picker.field === 'startTime' ? 'Start' : 'End'} time`
            : ''
        }
        value={pickerSlot && picker ? pickerSlot[picker.field] : '09:00'}
        onSelect={(time) =>
          picker &&
          updateDay(picker.day, (d) => ({
            ...d,
            slots: d.slots.map((s, i) => (i === picker.slot ? { ...s, [picker.field]: time } : s)),
          }))
        }
        onClose={() => setPicker(null)}
      />
    </ThemedView>
  );
}

function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={small ? styles.statValueSmall : styles.statValue} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

function Preset({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.preset,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText type="small" style={danger && { color: DANGER }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function TimeButton({ value, onPress }: { value: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.timeButton,
        { backgroundColor: theme.background, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText type="small">{formatTime(value)}</ThemedText>
    </Pressable>
  );
}

function CurrentTime({ timezone }: { timezone: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let formatted: string;
  try {
    formatted = now.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    formatted = 'Unavailable for this timezone';
  }

  return <ThemedText type="smallBold">{formatted}</ThemedText>;
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
    gap: Spacing.three,
  },
  loader: {
    marginTop: Spacing.six,
  },
  header: {
    gap: Spacing.half,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  statValueSmall: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: 700,
  },
  segmented: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Spacing.three,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  preset: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: 999,
  },
  days: {
    gap: Spacing.two,
  },
  dayCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  timeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  duration: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settings: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  defaultBadge: {
    color: BRAND,
    fontSize: 12,
  },
  clockCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  center: {
    textAlign: 'center',
  },
});

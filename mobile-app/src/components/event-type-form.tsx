import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton, AuthError, AuthInput, BRAND } from '@/components/auth-form';
import { MEET_TYPE_LABELS } from '@/components/event-type-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  createEventType,
  updateEventType,
  type EventType,
  type EventTypeInput,
} from '@/lib/query';

// Same palette as frontend/components/event-types/EventTypeForm.tsx
const COLORS = ['#0069ff', '#7c3aed', '#059669', '#dc2626', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
const DURATION_PRESETS = [15, 30, 45, 60];
const MEET_TYPES = Object.keys(MEET_TYPE_LABELS) as EventType['meetType'][];

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Full-screen sheet for creating (no `initial`) or editing an event type */
export function EventTypeForm({ initial, onClose }: { initial?: EventType; onClose: () => void }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isEdit = !!initial;

  const [form, setForm] = useState<EventTypeInput>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    duration: initial?.duration ?? 30,
    description: initial?.description ?? '',
    color: initial?.color ?? COLORS[0],
    meetType: initial?.meetType ?? 'google_meet',
    meetUrl: initial?.meetUrl ?? '',
  });
  const [durationText, setDurationText] = useState(String(form.duration));
  const [slugManual, setSlugManual] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = (patch: Partial<EventTypeInput>) => setForm((f) => ({ ...f, ...patch }));

  const mutation = useMutation({
    mutationFn: (input: EventTypeInput) =>
      initial ? updateEventType({ id: initial.id, ...input }) : createEventType(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
      // Meeting rows carry the event title and color
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onClose();
    },
  });

  const handleTitleChange = (title: string) =>
    update(slugManual ? { title } : { title, slug: slugify(title) });

  const setDuration = (minutes: number) => {
    update({ duration: minutes });
    setDurationText(String(minutes));
  };

  const handleSubmit = () => {
    setValidationError(null);
    if (!form.title.trim()) return setValidationError('Title is required');
    if (!form.slug.trim()) return setValidationError('Slug is required');
    if (!(form.duration >= 5)) return setValidationError('Duration must be at least 5 minutes');

    mutation.mutate({
      ...form,
      title: form.title.trim(),
      slug: slugify(form.slug),
      meetUrl: form.meetType === 'google_meet' ? form.meetUrl.trim() : '',
    });
  };

  const error = validationError ?? mutation.error?.message ?? null;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (!mutation.isPending) onClose();
      }}>
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable onPress={onClose} disabled={mutation.isPending} hitSlop={8}>
              <ThemedText type="small" themeColor="textSecondary">
                Cancel
              </ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={styles.headerTitle}>
              {isEdit ? 'Edit Event Type' : 'New Event Type'}
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <AuthError message={error} />

              <AuthInput
                label="Event Title"
                placeholder="e.g. 30 Minute Meeting"
                value={form.title}
                onChangeText={handleTitleChange}
              />
              <AuthInput
                label="URL Slug"
                placeholder="30-minute-meeting"
                value={form.slug}
                onChangeText={(slug) => {
                  setSlugManual(true);
                  update({ slug });
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.field}>
                <AuthInput
                  label="Duration (min)"
                  value={durationText}
                  onChangeText={(text) => {
                    setDurationText(text);
                    update({ duration: parseInt(text, 10) || 0 });
                  }}
                  keyboardType="number-pad"
                />
                <View style={styles.chips}>
                  {DURATION_PRESETS.map((m) => (
                    <Chip
                      key={m}
                      label={`${m} min`}
                      selected={form.duration === m}
                      onPress={() => setDuration(m)}
                    />
                  ))}
                </View>
              </View>

              <AuthInput
                label="Description"
                placeholder="Brief description of this event..."
                value={form.description}
                onChangeText={(description) => update({ description })}
                multiline
                style={styles.textarea}
              />

              <View style={styles.field}>
                <ThemedText type="smallBold">Color</ThemedText>
                <View style={styles.colors}>
                  {COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => update({ color: c })}
                      accessibilityLabel={`Color ${c}`}
                      style={[
                        styles.swatch,
                        { backgroundColor: c },
                        form.color === c && { borderColor: theme.text },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <ThemedText type="smallBold">Meeting Type</ThemedText>
                <View style={styles.chips}>
                  {MEET_TYPES.map((t) => (
                    <Chip
                      key={t}
                      label={MEET_TYPE_LABELS[t]}
                      selected={form.meetType === t}
                      onPress={() => update({ meetType: t })}
                    />
                  ))}
                </View>
              </View>

              {form.meetType === 'google_meet' && (
                <View style={styles.field}>
                  <AuthInput
                    label="Google Meet URL (optional)"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={form.meetUrl}
                    onChangeText={(meetUrl) => update({ meetUrl })}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    Leave blank to auto-generate a link on each booking.
                  </ThemedText>
                </View>
              )}

              <AuthButton
                title={isEdit ? 'Save Changes' : 'Create Event'}
                onPress={handleSubmit}
                loading={mutation.isPending}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: BRAND, borderColor: BRAND }
          : { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundElement },
      ]}>
      <ThemedText type="small" style={selected && styles.chipSelectedText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  field: {
    gap: Spacing.two,
  },
  textarea: {
    height: 88,
    paddingTop: Spacing.three,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipSelectedText: {
    color: '#ffffff',
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
});

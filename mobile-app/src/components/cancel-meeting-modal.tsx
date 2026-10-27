import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { DANGER } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cancelMeeting, type Meeting } from '@/lib/query';

export function CancelMeetingModal({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => {
      // Refreshes both tabs here and the dashboard, which share these queries
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      close();
    },
  });

  const close = () => {
    setReason('');
    mutation.reset();
    onClose();
  };

  return (
    <Modal
      visible={!!meeting}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!mutation.isPending) close();
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold" style={styles.title}>
            Cancel Meeting?
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Are you sure you want to cancel your meeting with {meeting?.inviteeName}? They&apos;ll
            get an email letting them know.
          </ThemedText>

          <ThemedText type="smallBold">Reason for cancellation (optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g., Unexpected conflict, will reschedule..."
            placeholderTextColor={theme.textSecondary}
            multiline
            editable={!mutation.isPending}
          />

          {mutation.error && (
            <ThemedText type="small" style={{ color: DANGER }}>
              {mutation.error.message}
            </ThemedText>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={close}
              disabled={mutation.isPending}
              style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">Back</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => meeting && mutation.mutate({ id: meeting.id, reason })}
              disabled={mutation.isPending}
              style={[styles.button, { backgroundColor: DANGER }]}>
              {mutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.dangerText}>
                  Confirm Cancel
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
  },
  input: {
    minHeight: 88,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    color: '#ffffff',
  },
});

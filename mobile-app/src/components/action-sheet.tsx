import { useRef } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DANGER } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ActionSheetOption = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

/** Bottom sheet menu; Alert can't show more than 3 buttons on Android */
export function ActionSheet({
  visible,
  title,
  options,
  onClose,
}: {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}) {
  const theme = useTheme();
  // iOS drops a modal/alert presented while another modal is still dismissing,
  // so run the chosen action from onDismiss there
  const pending = useRef<(() => void) | null>(null);

  const choose = (action: () => void) => {
    if (Platform.OS === 'ios') pending.current = action;
    onClose();
    if (Platform.OS !== 'ios') action();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={() => {
        pending.current?.();
        pending.current = null;
      }}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView edges={['bottom']} style={styles.sheetWrap}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            {title && (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                numberOfLines={1}
                style={styles.title}>
                {title}
              </ThemedText>
            )}
            {options.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => choose(opt.onPress)}
                style={({ pressed }) => [
                  styles.option,
                  { borderTopColor: theme.backgroundSelected },
                  pressed && { backgroundColor: theme.backgroundElement },
                ]}>
                <ThemedText style={opt.destructive && { color: DANGER }}>{opt.label}</ThemedText>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={onClose}
            style={[styles.sheet, styles.cancel, { backgroundColor: theme.background }]}>
            <ThemedText type="smallBold">Cancel</ThemedText>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetWrap: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sheet: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  option: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
});

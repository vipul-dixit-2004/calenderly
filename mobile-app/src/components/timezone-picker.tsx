import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BRAND } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { TIMEZONES } from '@/constants/timezones';
import { useTheme } from '@/hooks/use-theme';

const formatTz = (tz: string) => tz.replace(/_/g, ' ');

export function TimezonePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (tz: string) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  // The device timezone may not be in the curated list; keep it selectable
  const options = TIMEZONES.includes(value) ? TIMEZONES : [value, ...TIMEZONES];

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">Timezone</ThemedText>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText>{formatTz(value)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Change
        </ThemedText>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.sheetHeader}>
              <ThemedText type="smallBold">Select timezone</ThemedText>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <ThemedText type="linkPrimary">Done</ThemedText>
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(tz) => tz}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && { backgroundColor: theme.backgroundElement },
                  ]}>
                  <ThemedText>{formatTz(item)}</ThemedText>
                  {item === value && <ThemedText style={{ color: BRAND }}>✓</ThemedText>}
                </Pressable>
              )}
            />
          </SafeAreaView>
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  sheet: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});

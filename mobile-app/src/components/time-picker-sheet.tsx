import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BRAND } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STEP_MINUTES = 15;
const ROW_HEIGHT = 48;

// "00:00" … "23:45" in 15-minute steps, plus "23:59" so a slot can run to end of day
const TIMES = [
  ...Array.from({ length: (24 * 60) / STEP_MINUTES }, (_, i) => {
    const mins = i * STEP_MINUTES;
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  }),
  '23:59',
];

/** "13:30" → "1:30 PM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function TimePickerSheet({
  visible,
  title,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  value: string;
  onSelect: (time: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  // Existing rules may use minutes outside the 15-minute grid; keep them selectable
  const options = TIMES.includes(value) ? TIMES : [...TIMES, value].sort();
  const selectedIndex = Math.max(0, options.indexOf(value));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <ThemedText type="smallBold">{title}</ThemedText>
            <Pressable onPress={onClose} hitSlop={12}>
              <ThemedText type="linkPrimary">Done</ThemedText>
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(t) => t}
            initialScrollIndex={Math.max(0, selectedIndex - 3)}
            getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    (pressed || selected) && { backgroundColor: theme.backgroundElement },
                  ]}>
                  <ThemedText style={selected && { color: BRAND, fontWeight: 700 }}>
                    {formatTime(item)}
                  </ThemedText>
                  {selected && <ThemedText style={{ color: BRAND }}>✓</ThemedText>}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
});

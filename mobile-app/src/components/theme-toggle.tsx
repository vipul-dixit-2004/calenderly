import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setThemePreference } from '@/lib/theme-preference';

export function ThemeToggle() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      onPress={() => setThemePreference(isDark ? 'light' : 'dark')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <SymbolView
        name={
          isDark
            ? { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' }
            : { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }
        }
        tintColor={theme.text}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
});

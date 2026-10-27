import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

// Not sensitive; SecureStore is just the key-value store the app already has
const THEME_KEY = 'theme-preference';

type ThemePreference = 'light' | 'dark';

/**
 * Overrides the color scheme for the whole app: every useColorScheme() call
 * (themed components, tab bar, navigation theme) picks it up.
 */
export async function setThemePreference(theme: ThemePreference) {
  Appearance.setColorScheme(theme);
  await SecureStore.setItemAsync(THEME_KEY, theme);
}

/** Applies a saved preference on launch; falls back to following the system */
export async function restoreThemePreference() {
  try {
    const saved = await SecureStore.getItemAsync(THEME_KEY);
    if (saved === 'light' || saved === 'dark') Appearance.setColorScheme(saved);
  } catch {
    // Keep the system theme if the store can't be read
  }
}

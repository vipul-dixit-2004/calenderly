import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const BRAND = '#006BFF';
export const DANGER = '#DC2626';

type AuthInputProps = TextInputProps & {
  label: string;
  /** Fixed text shown before the input, e.g. a URL prefix */
  prefix?: string;
  /** Element shown at the right edge, e.g. a show/hide toggle */
  accessory?: ReactNode;
  error?: string | null;
};

export function AuthInput({ label, prefix, accessory, error, style, ...rest }: AuthInputProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.backgroundElement },
          error ? { borderColor: DANGER } : null,
        ]}>
        {prefix && (
          <ThemedText type="small" themeColor="textSecondary">
            {prefix}
          </ThemedText>
        )}
        <TextInput
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textSecondary}
          {...rest}
        />
        {accessory}
      </View>
      {error && (
        <ThemedText type="small" style={{ color: DANGER }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

export function AuthButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, { opacity: inactive ? 0.5 : pressed ? 0.8 : 1 }]}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <ThemedText style={styles.buttonText}>{title}</ThemedText>
      )}
    </Pressable>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <ThemedText type="small" style={{ color: DANGER }}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 600,
  },
  errorBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
});

import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton, AuthError, AuthInput, BRAND } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimezonePicker } from '@/components/timezone-picker';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getDeviceTimezone } from '@/constants/timezones';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

const toUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);

function PasswordStrength({ password }: { password: string }) {
  const theme = useTheme();
  if (!password) return null;

  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#DC2626', '#F59E0B', '#16A34A', BRAND];

  return (
    <View style={styles.strength}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              { backgroundColor: i <= score ? colors[score] : theme.backgroundSelected },
            ]}
          />
        ))}
      </View>
      <ThemedText type="small" style={{ color: colors[score] }}>
        {levels[score]}
      </ThemedText>
    </View>
  );
}

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timezone, setTimezone] = useState(getDeviceTimezone);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Suggest a username from the name until the user types their own
  const handleNameChange = (value: string) => {
    setName(value);
    if (!usernameEdited) setUsername(toUsername(value));
  };

  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim() || !email.trim() || !username.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!/^[a-z0-9_-]+$/i.test(username)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    setLoading(true);
    try {
      // On success the root layout's guard swaps this screen for the tabs
      await signUp({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
        timezone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const eyeToggle = (
    <Pressable onPress={() => setShowPassword((p) => !p)} hitSlop={8}>
      <ThemedText type="small" themeColor="textSecondary">
        {showPassword ? 'Hide' : 'Show'}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText type="subtitle">Create your account</ThemedText>
              <ThemedText themeColor="textSecondary">Get started - it&apos;s free</ThemedText>
            </View>

            <AuthError message={error} />

            <AuthInput
              label="Full name"
              placeholder="Jane Smith"
              value={name}
              onChangeText={handleNameChange}
              autoComplete="name"
              textContentType="name"
              editable={!loading}
            />
            <AuthInput
              label="Username"
              prefix="calenderly.com/"
              placeholder="janesmith"
              value={username}
              onChangeText={(v) => {
                setUsernameEdited(true);
                setUsername(toUsername(v));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              editable={!loading}
            />
            <AuthInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
            />
            <View style={styles.passwordGroup}>
              <AuthInput
                label="Password"
                placeholder="Min. 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                accessory={eyeToggle}
                editable={!loading}
              />
              <PasswordStrength password={password} />
            </View>
            <AuthInput
              label="Confirm password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              error={passwordMismatch ? "Passwords don't match" : null}
              editable={!loading}
            />
            <TimezonePicker value={timezone} onChange={setTimezone} />

            <AuthButton title="Create account" onPress={handleSubmit} loading={loading} />

            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              By signing up you agree to our Terms of Service and Privacy Policy
            </ThemedText>

            <View style={styles.switchRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Already have an account?
              </ThemedText>
              <Link href="/login" replace>
                <ThemedText type="smallBold" style={{ color: BRAND }}>
                  Sign in
                </ThemedText>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
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
  form: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  passwordGroup: {
    gap: Spacing.two,
  },
  strength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.one,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  center: {
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});

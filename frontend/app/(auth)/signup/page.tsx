'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#DC2626', '#F59E0B', '#16A34A', '#006BFF'];

  if (!password) return null;

  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="auth-strength-bar"
            style={{ background: i <= score ? colors[score] : 'var(--color-border)' }}
          />
        ))}
      </div>
      <span className="auth-strength-label" style={{ color: colors[score] }}>
        {levels[score]}
      </span>
    </div>
  );
}

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  // Auto-generate username from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!username || username === name.toLowerCase().replace(/\s+/g, '').slice(0, 20)) {
      setUsername(value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await signup(name.trim(), email.trim(), username.trim(), password);
      router.push('/event-types');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <Image src="/logo.svg" alt="Calenderly" width={32} height={32} />
          </div>
          <span className="auth-logo-text">Calenderly</span>
        </div>

        <div className="auth-card-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Get started - it&apos;s free</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="auth-field-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoComplete="name"
                autoFocus
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="username">Username</label>
              <div className="auth-input-prefix-wrap">
                <span className="auth-input-prefix">calenderly.com/</span>
                <input
                  id="username"
                  type="text"
                  className="auth-input auth-input-prefixed"
                  placeholder="janesmith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  autoComplete="username"
                  required
                />
              </div>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input-padded"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input ${confirmPassword && confirmPassword !== password ? 'auth-input--error' : ''}`}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {confirmPassword && confirmPassword !== password && (
                <span className="auth-field-error">Passwords don&apos;t match</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : 'Create account'}
          </button>

          <p className="auth-terms">
            By signing up you agree to our{' '}
            <span className="auth-link">Terms of Service</span> and{' '}
            <span className="auth-link">Privacy Policy</span>
          </p>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

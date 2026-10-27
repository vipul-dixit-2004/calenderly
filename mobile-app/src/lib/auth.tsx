import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { api, ApiError, setUnauthorizedHandler, tokenStore } from '@/lib/api';
import { queryClient } from '@/lib/query';

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  timezone: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
};

export type SignUpInput = {
  name: string;
  email: string;
  username: string;
  password: string;
  timezone: string;
};

type AuthResponse = { user: User; token: string };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from a stored token on launch
  useEffect(() => {
    (async () => {
      try {
        if (await tokenStore.get()) {
          const { user } = await api<{ user: User }>('/auth/me');
          setUser(user);
        }
      } catch (err) {
        // Expired/invalid token: drop it. Network errors keep it for next launch.
        if (err instanceof ApiError && err.status === 401) await tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const startSession = async ({ user, token }: AuthResponse) => {
    await tokenStore.set(token);
    setUser(user);
  };

  const signIn = async (email: string, password: string) => {
    const res = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await startSession(res);
  };

  // Backend creates a default schedule and starter event type for new users
  const signUp = async (input: SignUpInput) => {
    const res = await api<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await startSession(res);
  };

  // JWTs are stateless, so signing out is just forgetting the token.
  // Clearing the query cache keeps one account's data from showing for the next.
  const signOut = async () => {
    await tokenStore.clear();
    queryClient.clear();
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calenderly - Sign In',
  description: 'Sign in to your Calenderly account',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      {children}
    </div>
  );
}

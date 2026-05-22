'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  timezone: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Dashboard</h1>
      </div>
      {user && (
        <div className="header-right">
          <div className="header-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{user.name}</span>
            <span className="header-user-tz">{user.timezone}</span>
          </div>
        </div>
      )}
    </header>
  );
}

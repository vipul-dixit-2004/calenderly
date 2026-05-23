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

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="md:hidden mr-4 p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md" 
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="header-right">
        {/* Notification / person icon
        <button className="header-icon-btn" aria-label="Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button> */}

        {user && (
          <button className="header-user-btn" aria-label="User menu">
            <div className="header-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

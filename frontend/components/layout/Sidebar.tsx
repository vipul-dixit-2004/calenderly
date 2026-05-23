'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const primaryNavItems = [
  {
    label: 'Scheduling',
    href: '/event-types',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Meetings',
    href: '/meetings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Availability',
    href: '/availability',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  // {
  //   label: 'Contacts',
  //   href: '/contacts',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  //       <circle cx="12" cy="7" r="4"/>
  //     </svg>
  //   ),
  // },
  // {
  //   label: 'Workflows',
  //   href: '/workflows',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  //     </svg>
  //   ),
  // },
  // {
  //   label: 'Integrations & apps',
  //   href: '/integrations',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/>
  //       <rect x="15" y="14" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/>
  //     </svg>
  //   ),
  // },
  // {
  //   label: 'Routing',
  //   href: '/routing',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <polyline points="16 3 21 3 21 8"/>
  //       <line x1="4" y1="20" x2="21" y2="3"/>
  //       <polyline points="21 16 21 21 16 21"/>
  //       <line x1="15" y1="15" x2="21" y2="21"/>
  //     </svg>
  //   ),
  // },
];

const bottomNavItems = [
  // {
  //   label: 'Upgrade plan',
  //   href: '/upgrade',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <circle cx="12" cy="12" r="10" />
  //       <line x1="12" y1="8" x2="12" y2="16" />
  //       <line x1="8" y1="12" x2="16" y2="12" />
  //     </svg>
  //   ),
  //   highlight: true,
  // },
  // {
  //   label: 'Analytics',
  //   href: '/analytics',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <line x1="18" y1="20" x2="18" y2="10" />
  //       <line x1="12" y1="20" x2="12" y2="4" />
  //       <line x1="6" y1="20" x2="6" y2="14" />
  //     </svg>
  //   ),
  // },
  // {
  //   label: 'Admin center',
  //   href: '/admin',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  //     </svg>
  //   ),
  // },
];

export default function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onCloseMobile} />
      )}
      <aside className={`sidebar ${mobileOpen ? 'max-md:!flex max-md:absolute max-md:left-0 max-md:top-0 max-md:h-full z-50' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/event-types" className="sidebar-logo-link">
          <div className="logo-mark">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <circle cx="16" cy="16" r="16" fill="#006BFF" />
              <path d="M10 16a6 6 0 1 1 12 0 6 6 0 0 1-12 0z" fill="white" />
              <path d="M16 10v6l4 2" stroke="#006BFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">Calenderly</span>
        </Link>
      </div>

      {/* Create button */}
      <div className="sidebar-create">
        <Link href="/event-types?create=true" className="btn-create">
          <span className="btn-create-icon">+</span>
          <span>Create</span>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="sidebar-nav">
        {primaryNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${item.highlight ? 'sidebar-link--upgrade' : ''} ${isActive ? 'sidebar-link--active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </Link>
          );
        })}

        {/* Help */}
        <button className="sidebar-link sidebar-help-btn">
          <span className="sidebar-link-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <span className="sidebar-link-label">Help</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </aside>
    </>
  );
}

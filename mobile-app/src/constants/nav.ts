import type { AndroidSymbol, SFSymbol } from 'expo-symbols';

// Tabs mirror the web sidebar (frontend/components/layout/Sidebar.tsx), plus Home for the dashboard
export const NAV_ITEMS: {
  name: string;
  href: '/' | '/scheduling' | '/meetings' | '/availability' | '/assistant';
  label: string;
  sf: { default: SFSymbol; selected: SFSymbol };
  md: AndroidSymbol;
}[] = [
  { name: 'index', href: '/', label: 'Home', sf: { default: 'house', selected: 'house.fill' }, md: 'home' },
  { name: 'scheduling', href: '/scheduling', label: 'Scheduling', sf: { default: 'link', selected: 'link' }, md: 'link' },
  { name: 'meetings', href: '/meetings', label: 'Meetings', sf: { default: 'calendar', selected: 'calendar' }, md: 'event' },
  { name: 'availability', href: '/availability', label: 'Availability', sf: { default: 'clock', selected: 'clock.fill' }, md: 'schedule' },
  { name: 'assistant', href: '/assistant', label: 'Assistant', sf: { default: 'sparkles', selected: 'sparkles' }, md: 'auto_awesome' },
];

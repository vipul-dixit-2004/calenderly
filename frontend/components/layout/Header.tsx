'use client';

import { useEffect, useState } from 'react';
import { getMe, updateMe } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  timezone: string;
}

const baseTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  const handleOpenModal = () => {
    if (user) {
      setEditUser({ ...user });
      setShowModal(true);
    }
  };

  const handleSave = async () => {
    if (!editUser) return;
    if (!editUser.name.trim() || !editUser.username.trim() || !editUser.email.trim()) {
      alert('Name, username, and email cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateMe({
        name: editUser.name,
        email: editUser.email,
        username: editUser.username,
        timezone: editUser.timezone,
      });
      setUser(updated);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const timezones = editUser ? Array.from(new Set([...baseTimezones, editUser.timezone])) : baseTimezones;

  return (
    <>
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
          {user && (
            <button className="header-user-btn" aria-label="User menu" onClick={handleOpenModal}>
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

      {showModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Personal Details</h2>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={!editUser.name.trim() ? { borderColor: 'var(--color-error)' } : {}}
                  value={editUser.name}
                  onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                />
                {!editUser.name.trim() && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>Name cannot be empty.</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  style={!editUser.username.trim() ? { borderColor: 'var(--color-error)' } : {}}
                  value={editUser.username}
                  onChange={e => setEditUser({ ...editUser, username: e.target.value })}
                />
                {!editUser.username.trim() && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>Username cannot be empty.</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editUser.email}
                  disabled={true}
                  style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'var(--color-bg-tertiary)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <div className="avail-tz-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <select
                    className="form-input avail-tz-select"
                    value={editUser.timezone}
                    onChange={e => setEditUser({ ...editUser, timezone: e.target.value })}
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave} 
                disabled={isSaving || !editUser.name.trim() || !editUser.username.trim() || !editUser.email.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

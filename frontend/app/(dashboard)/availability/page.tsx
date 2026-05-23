'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getAvailability,
  updateRules,
  updateTimezone,
} from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';

/* ─── Types ─────────────────────────────────────────────── */
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DayConfig {
  dayOfWeek: number;
  enabled: boolean;
  slots: TimeSlot[];
}

interface Schedule {
  id: string;
  name: string;
  timezone: string;
  isDefault: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_DAYS: DayConfig[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  enabled: i >= 1 && i <= 5, // Mon–Fri enabled by default
  slots: [{ startTime: '09:00', endTime: '17:00' }],
}));

const TIMEZONES = [
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

function calcDuration(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

/* ─── Single Time Slot Row ──────────────────────────────── */
function SlotRow({
  slot,
  canRemove,
  onUpdate,
  onRemove,
}: {
  slot: TimeSlot;
  canRemove: boolean;
  onUpdate: (s: TimeSlot) => void;
  onRemove: () => void;
}) {
  return (
    <div className="avail-slot-row">
      <div className="avail-time-input-wrap">
        <input
          type="time"
          className="avail-time-input"
          value={slot.startTime}
          onChange={(e) => onUpdate({ ...slot, startTime: e.target.value })}
        />
      </div>
      <span className="avail-time-sep">→</span>
      <div className="avail-time-input-wrap">
        <input
          type="time"
          className="avail-time-input"
          value={slot.endTime}
          onChange={(e) => onUpdate({ ...slot, endTime: e.target.value })}
        />
      </div>
      <span className="avail-duration-badge">
        {calcDuration(slot.startTime, slot.endTime)}
      </span>
      {canRemove && (
        <button
          className="avail-slot-remove"
          onClick={onRemove}
          title="Remove time slot"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Day Row Component ─────────────────────────────────── */
function DayRow({
  day,
  onChange,
}: {
  day: DayConfig;
  onChange: (d: DayConfig) => void;
}) {
  const addSlot = () => {
    // Default new slot starts after the last slot ends
    const lastSlot = day.slots[day.slots.length - 1];
    const newStart = lastSlot?.endTime || '13:00';
    // Add 2 hours for the new slot end
    const [h, m] = newStart.split(':').map(Number);
    const endMins = Math.min(h * 60 + m + 120, 23 * 60 + 59);
    const endH = String(Math.floor(endMins / 60)).padStart(2, '0');
    const endM = String(endMins % 60).padStart(2, '0');
    onChange({
      ...day,
      slots: [...day.slots, { startTime: newStart, endTime: `${endH}:${endM}` }],
    });
  };

  const updateSlot = (idx: number, slot: TimeSlot) => {
    onChange({
      ...day,
      slots: day.slots.map((s, i) => (i === idx ? slot : s)),
    });
  };

  const removeSlot = (idx: number) => {
    onChange({
      ...day,
      slots: day.slots.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className={`avail-day-row ${day.enabled ? 'avail-day-row--active' : ''}`}>
      {/* Toggle */}
      <label className="avail-toggle" htmlFor={`toggle-day-${day.dayOfWeek}`}>
        <input
          id={`toggle-day-${day.dayOfWeek}`}
          type="checkbox"
          className="avail-toggle-input"
          checked={day.enabled}
          onChange={(e) => onChange({ ...day, enabled: e.target.checked })}
        />
        <span className="avail-toggle-track">
          <span className="avail-toggle-thumb" />
        </span>
      </label>

      {/* Day label */}
      <span className={`avail-day-label ${day.enabled ? 'avail-day-label--on' : ''}`}>
        <span className="avail-day-full">{DAYS[day.dayOfWeek]}</span>
        <span className="avail-day-short">{DAY_SHORT[day.dayOfWeek]}</span>
      </span>

      {/* Time slots */}
      {day.enabled ? (
        <div className="avail-slots-container">
          {day.slots.map((slot, idx) => (
            <SlotRow
              key={idx}
              slot={slot}
              canRemove={day.slots.length > 1}
              onUpdate={(s) => updateSlot(idx, s)}
              onRemove={() => removeSlot(idx)}
            />
          ))}
          <button
            className="avail-add-slot-btn"
            onClick={addSlot}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add time slot
          </button>
        </div>
      ) : (
        <span className="avail-unavailable-label">Unavailable</span>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [days, setDays] = useState<DayConfig[]>(DEFAULT_DAYS);
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTz, setSavingTz] = useState(false);
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'weekly' | 'info'>('weekly');

  const fetchData = useCallback(async () => {
    try {
      const data = await getAvailability();
      setSchedule(data.schedule);
      setTimezone(data.schedule.timezone);

      // Group server rules by dayOfWeek to build multi-slot day configs
      const rulesByDay: Record<number, TimeSlot[]> = {};
      for (const r of data.rules as { dayOfWeek: number; startTime: string; endTime: string }[]) {
        if (!rulesByDay[r.dayOfWeek]) rulesByDay[r.dayOfWeek] = [];
        rulesByDay[r.dayOfWeek].push({ startTime: r.startTime, endTime: r.endTime });
      }

      const merged = DEFAULT_DAYS.map((def) => {
        const serverSlots = rulesByDay[def.dayOfWeek];
        if (serverSlots && serverSlots.length > 0) {
          return { ...def, enabled: true, slots: serverSlots };
        }
        return def;
      });
      setDays(merged);
    } catch (err) {
      console.error('Failed to load availability:', err);
      // Keep defaults if no schedule exists yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      // Flatten: each day's enabled slots become individual rules
      const activeRules: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
      for (const day of days) {
        if (!day.enabled) continue;
        for (const slot of day.slots) {
          activeRules.push({
            dayOfWeek: day.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      }
      await updateRules(activeRules);
      showToast('Availability saved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTimezone = async () => {
    setSavingTz(true);
    try {
      await updateTimezone(timezone);
      showToast('Timezone updated!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update timezone', 'error');
    } finally {
      setSavingTz(false);
    }
  };

  const updateDay = (idx: number, d: DayConfig) => {
    setDays((prev) => prev.map((old, i) => (i === idx ? d : old)));
  };

  const enabledCount = days.filter((d) => d.enabled).length;
  const totalSlots = days.reduce((sum, d) => sum + (d.enabled ? d.slots.length : 0), 0);

  if (loading) {
    return (
      <div className="page-loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="meetings-page">
      {/* Page Header */}
      <div className="meetings-title-row" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className="meetings-title">Availability</h1>
          <span className="meetings-info-icon" title="Set when you're available for meetings each week">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
        </div>
        <button
          id="save-availability-btn"
          className="btn btn-primary"
          onClick={handleSaveRules}
          disabled={saving}
          style={{ minWidth: 140 }}
        >
          {saving ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Stats bar */}
      <div className="avail-stats" style={{ marginBottom: '24px' }}>
        <div className="avail-stat-card">
          <div className="avail-stat-num">{enabledCount}</div>
          <div className="avail-stat-label">Days available</div>
        </div>
        <div className="avail-stat-card">
          <div className="avail-stat-num">{totalSlots}</div>
          <div className="avail-stat-label">Time slots</div>
        </div>
        <div className="avail-stat-card">
          <div className="avail-stat-num" style={{ fontSize: 16 }}>
            {timezone.split('/').pop()?.replace('_', ' ') ?? timezone}
          </div>
          <div className="avail-stat-label">Timezone</div>
        </div>
        {schedule && (
          <div className="avail-stat-card">
            <div className="avail-stat-num" style={{ fontSize: 14 }}>{schedule.name}</div>
            <div className="avail-stat-label">Schedule name</div>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="meetings-card">
        {/* Section tabs */}
        <div className="meetings-tabs-bar">
          <div className="meetings-tabs">
            <button
              id="tab-weekly"
              className={`meetings-tab ${activeSection === 'weekly' ? 'meetings-tab--active' : ''}`}
              onClick={() => setActiveSection('weekly')}
            >
              Weekly Hours
            </button>
            <button
              id="tab-settings"
              className={`meetings-tab ${activeSection === 'info' ? 'meetings-tab--active' : ''}`}
              onClick={() => setActiveSection('info')}
            >
              Timezone &amp; Settings
            </button>
          </div>
        </div>

        <div className="meetings-content" style={{ padding: '24px' }}>
          {/* ── Weekly Hours Panel ── */}
          {activeSection === 'weekly' && (
            <div>
              <div className="avail-card-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h3 className="avail-card-title">Weekly Schedule</h3>
                <p className="avail-card-subtitle">Toggle days on/off and set multiple time slots per day</p>
              </div>

              {/* Quick-set presets */}
              <div className="avail-presets" style={{ padding: '0 0 16px 0' }}>
                <span className="avail-presets-label">Quick set:</span>
                <button
                  className="avail-preset-btn"
                  onClick={() =>
                    setDays((prev) =>
                      prev.map((d) => ({
                        ...d,
                        enabled: d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
                        slots: [{ startTime: '09:00', endTime: '17:00' }],
                      }))
                    )
                  }
                >
                  Mon – Fri
                </button>
                <button
                  className="avail-preset-btn"
                  onClick={() =>
                    setDays((prev) =>
                      prev.map((d) => ({
                        ...d,
                        enabled: d.dayOfWeek >= 1 && d.dayOfWeek <= 6,
                        slots: [{ startTime: '09:00', endTime: '17:00' }],
                      }))
                    )
                  }
                >
                  Mon – Sat
                </button>
                <button
                  className="avail-preset-btn"
                  onClick={() =>
                    setDays((prev) =>
                      prev.map((d) => ({
                        ...d,
                        enabled: true,
                        slots: [{ startTime: '09:00', endTime: '17:00' }],
                      }))
                    )
                  }
                >
                  All Week
                </button>
                <button
                  className="avail-preset-btn avail-preset-btn--danger"
                  onClick={() =>
                    setDays((prev) =>
                      prev.map((d) => ({ ...d, enabled: false }))
                    )
                  }
                >
                  Clear All
                </button>
              </div>

              {/* Day rows */}
              <div className="avail-days" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {days.map((day, idx) => (
                  <DayRow
                    key={day.dayOfWeek}
                    day={day}
                    onChange={(d) => updateDay(idx, d)}
                  />
                ))}
              </div>

              {/* Save button (bottom) */}
              <div className="avail-card-footer" style={{ background: 'transparent', padding: '20px 0 0 0', marginTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  id="save-weekly-btn"
                  className="btn btn-primary"
                  onClick={handleSaveRules}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Saving…
                    </>
                  ) : (
                    'Save Weekly Schedule'
                  )}
                </button>
                <span className="avail-footer-note">
                  {enabledCount} of 7 days enabled · {totalSlots} time slot{totalSlots !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* ── Timezone & Settings Panel ── */}
          {activeSection === 'info' && (
            <div>
              <div className="avail-card-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
                <h3 className="avail-card-title">Timezone &amp; Settings</h3>
                <p className="avail-card-subtitle">Configure your timezone so invitees see correct local times</p>
              </div>

              <div>
                {/* Timezone selector */}
                <div className="form-group">
                  <label className="form-label" htmlFor="timezone-select">Your Timezone</label>
                  <div className="avail-tz-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <select
                      id="timezone-select"
                      className="form-input avail-tz-select"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <p className="avail-field-hint">
                    Invitees will see available slots converted to their local timezone automatically.
                  </p>
                </div>

                {/* Schedule name (read-only info) */}
                {schedule && (
                  <div className="form-group">
                    <label className="form-label">Schedule Name</label>
                    <div className="avail-info-row">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>{schedule.name}</span>
                      {schedule.isDefault && (
                        <span className="avail-default-badge">Default</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Current time preview */}
                <div className="avail-tz-preview">
                  <div className="avail-tz-preview-label">Current time in selected timezone</div>
                  <CurrentTimeDisplay timezone={timezone} />
                </div>

                <button
                  id="save-timezone-btn"
                  className="btn btn-primary"
                  onClick={handleSaveTimezone}
                  disabled={savingTz}
                  style={{ marginTop: 8 }}
                >
                  {savingTz ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Saving…
                    </>
                  ) : (
                    'Save Timezone'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Live clock for selected TZ ───────────────────────── */
function CurrentTimeDisplay({ timezone }: { timezone: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = now.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return <div className="avail-clock">{formatted}</div>;
}

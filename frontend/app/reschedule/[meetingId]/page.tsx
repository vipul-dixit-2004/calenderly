'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getMeetingForReschedule, getSlots, rescheduleBooking } from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import BookingCalendar from '@/components/booking/BookingCalendar';
import TimeSlots from '@/components/booking/TimeSlots';
import RescheduleForm from '@/components/booking/RescheduleForm';
import Link from 'next/link';

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

interface MeetingRescheduleInfo {
  id: string;
  startTime: string;
  endTime: string;
  inviteeName: string;
  inviteeEmail: string;
  eventTitle: string;
  duration: number;
  color: string;
  meetType: string;
  slug: string;
  hostName: string;
  hostUsername: string;
  hostTimezone: string;
}

type Step = 'select' | 'form' | 'confirmed';

export default function ReschedulePage() {
  const params = useParams<{ meetingId: string }>();
  const { meetingId } = params;

  const [meetingInfo, setMeetingInfo] = useState<MeetingRescheduleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Selection
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('select');

  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  useEffect(() => {
    try {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setUserTimezone('UTC');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMeetingForReschedule(meetingId);
        setMeetingInfo(data);
      } catch (err: any) {
        setError(err.message || 'Meeting not found or cannot be rescheduled.');
      } finally {
        setLoading(false);
      }
    })();
  }, [meetingId]);

  const fetchSlots = useCallback(async (date: string) => {
    if (!meetingInfo) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const data = await getSlots(meetingInfo.hostUsername, meetingInfo.slug, date, userTimezone);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [meetingInfo, userTimezone]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep('select');
    setSelectedSlot(null);
    fetchSlots(date);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleReschedule = async (reason: string) => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await rescheduleBooking(meetingId, {
        startTime: selectedSlot,
        reason,
      });
      setStep('confirmed');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rescheduling failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <span className="spinner" />
          <p>Loading meeting details…</p>
        </div>
      </div>
    );
  }

  if (error || !meetingInfo) {
    return (
      <div className="booking-page">
        <div className="booking-error-card">
          <div className="booking-error-icon">😕</div>
          <h2>Cannot Reschedule</h2>
          <p>{error || 'This meeting is no longer available.'}</p>
        </div>
      </div>
    );
  }

  if (step === 'confirmed') {
    return (
      <div className="booking-page">
        <div className="booking-error-card" style={{ maxWidth: 500 }}>
          <div className="booking-error-icon">✅</div>
          <h2>Rescheduled Successfully!</h2>
          <p style={{ marginBottom: 20 }}>
            Your meeting with {meetingInfo.hostName} has been rescheduled to{' '}
            <strong>{formatDateLong(selectedDate!, userTimezone)}</strong> at <strong>{formatTime(selectedSlot!, userTimezone)}</strong>.
          </p>
          <p style={{ marginBottom: 24, fontSize: 13 }}>
            A calendar invitation has been updated and sent to your email address.
          </p>
          <button className="btn btn-primary" onClick={() => window.close()}>
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-card">
        {/* Left Panel — Event Info */}
        <div className="booking-info" style={{ borderColor: meetingInfo.color }}>
          <div className="booking-info-inner">
            <div className="booking-host-avatar" style={{ background: meetingInfo.color }}>
              {meetingInfo.hostName.charAt(0).toUpperCase()}
            </div>
            <p className="booking-host-name">{meetingInfo.hostName}</p>
            <h1 className="booking-event-title">{meetingInfo.eventTitle}</h1>

            <div className="booking-meta">
              <div className="booking-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{meetingInfo.duration} min</span>
              </div>
              <div className="booking-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{meetingInfo.hostTimezone}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <strong>Former Time</strong>
              </p>
              <p style={{ fontSize: 14, color: 'var(--color-text)', textDecoration: 'line-through' }}>
                {formatDateLong(meetingInfo.startTime.split('T')[0], userTimezone)} <br />
                {formatTime(meetingInfo.startTime, userTimezone)}
              </p>
            </div>

            {selectedDate && selectedSlot && (
              <div className="booking-selected-summary" style={{ marginTop: 24 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {formatDateLong(selectedDate, userTimezone)} at {formatTime(selectedSlot, userTimezone)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Calendar + Slots or Form */}
        <div className="booking-picker">
          {step === 'form' && selectedSlot ? (
            <RescheduleForm
              onBack={handleBack}
              onSubmit={handleReschedule}
              submitting={submitting}
              selectedDate={selectedDate!}
              selectedTime={selectedSlot}
              duration={meetingInfo.duration}
              userTimezone={userTimezone}
            />
          ) : (
            <>
              <div className="booking-picker-header">
                <h2>Select a New Date &amp; Time</h2>
                <div style={{ marginTop: '8px' }}>
                  <label htmlFor="tz-select" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>Timezone:</label>
                  <select
                    id="tz-select"
                    className="form-input"
                    value={userTimezone}
                    onChange={(e) => setUserTimezone(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '13px', width: 'auto', display: 'inline-block' }}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="booking-picker-body">
                <BookingCalendar
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />
                <TimeSlots
                  date={selectedDate}
                  slots={slots}
                  loading={slotsLoading}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                  duration={meetingInfo.duration}
                  userTimezone={userTimezone}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <p className="booking-powered">
        Powered by <strong>Calenderly</strong>
      </p>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────── */
function formatDateLong(dateStr: string, timeZone?: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  });
}

function formatTime(iso: string, timeZone?: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  });
}

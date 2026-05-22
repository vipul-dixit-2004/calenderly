'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getEventBySlug, getSlots, createBooking } from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import BookingCalendar from '@/components/booking/BookingCalendar';
import TimeSlots from '@/components/booking/TimeSlots';
import BookingForm from '@/components/booking/BookingForm';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

interface EventInfo {
  id: string;
  title: string;
  slug: string;
  duration: number;
  description: string | null;
  meetType: string;
  color: string;
  hostName: string;
  hostTimezone: string;
}

interface MeetingResult {
  meeting: {
    id: string;
    startTime: string;
    endTime: string;
    inviteeName: string;
    inviteeEmail: string;
    meetUrl: string | null;
    meetAddress: string | null;
    meetPhone: string | null;
  };
  eventType: {
    title: string;
    duration: number;
  };
}

type Step = 'select' | 'form' | 'confirmed';

export default function PublicBookingPage() {
  const params = useParams<{ username: string; slug: string }>();
  const { username, slug } = params;

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Selection
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('select');

  // Booking result
  const [bookingResult, setBookingResult] = useState<MeetingResult | null>(null);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Fetch event info
  useEffect(() => {
    (async () => {
      try {
        const data = await getEventBySlug(username, slug);
        setEvent(data);
      } catch {
        setError('This event type could not be found or is no longer available.');
      } finally {
        setLoading(false);
      }
    })();
  }, [username, slug]);

  // Fetch slots when date changes
  const fetchSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const data = await getSlots(username, slug, date);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [username, slug]);

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

  const handleBook = async (name: string, email: string, meetAddress?: string, meetPhone?: string) => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const result = await createBooking(username, slug, {
        inviteeName: name,
        inviteeEmail: email,
        startTime: selectedSlot,
        meetAddress,
        meetPhone,
      });
      setBookingResult(result);
      setStep('confirmed');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedSlot(null);
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <span className="spinner" />
          <p>Loading event details…</p>
        </div>
      </div>
    );
  }

  // ─── Error / Not found ───
  if (error || !event) {
    return (
      <div className="booking-page">
        <div className="booking-error-card">
          <div className="booking-error-icon">😕</div>
          <h2>Event Not Found</h2>
          <p>{error || 'This event is no longer available.'}</p>
        </div>
      </div>
    );
  }

  // ─── Confirmed ───
  if (step === 'confirmed' && bookingResult) {
    return (
      <div className="booking-page">
        <BookingConfirmation
          event={event}
          meeting={bookingResult.meeting}
        />
      </div>
    );
  }

  // ─── Main booking view ───
  return (
    <div className="booking-page">
      <div className="booking-card">
        {/* Left Panel — Event Info */}
        <div className="booking-info" style={{ borderColor: event.color }}>
          <div className="booking-info-inner">
            <div className="booking-host-avatar" style={{ background: event.color }}>
              {event.hostName.charAt(0).toUpperCase()}
            </div>
            <p className="booking-host-name">{event.hostName}</p>
            <h1 className="booking-event-title">{event.title}</h1>

            <div className="booking-meta">
              <div className="booking-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{event.duration} min</span>
              </div>
              <div className="booking-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{event.hostTimezone}</span>
              </div>
            </div>

            {event.description && (
              <p className="booking-description">{event.description}</p>
            )}

            {selectedDate && selectedSlot && (
              <div className="booking-selected-summary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {formatDateLong(selectedDate)} at {formatTime(selectedSlot)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Calendar + Slots or Form */}
        <div className="booking-picker">
          {step === 'form' && selectedSlot ? (
            <BookingForm
              onBack={handleBack}
              onSubmit={handleBook}
              submitting={submitting}
              selectedDate={selectedDate!}
              selectedTime={selectedSlot}
              duration={event.duration}
              meetType={event.meetType}
            />
          ) : (
            <>
              <div className="booking-picker-header">
                <h2>Select a Date &amp; Time</h2>
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
                  duration={event.duration}
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
function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

'use client';

interface Props {
  date: string | null;
  slots: string[];
  loading: boolean;
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  duration: number;
  userTimezone: string;
}

export default function TimeSlots({
  date,
  slots,
  loading,
  selectedSlot,
  onSelect,
  duration,
  userTimezone,
}: Props) {
  if (!date) {
    return (
      <div className="slots-panel slots-panel--empty">
        <div className="slots-empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="slots-empty-text">Select a date to view available times</p>
      </div>
    );
  }

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: userTimezone,
  });

  return (
    <div className="slots-panel">
      <h3 className="slots-date-label">{dateLabel}</h3>

      {loading ? (
        <div className="slots-loading">
          <span className="spinner" />
          <p>Loading times…</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="slots-none">
          <p>No available times for this date.</p>
          <p className="slots-none-hint">Try selecting another day.</p>
        </div>
      ) : (
        <div className="slots-list">
          {slots.map((slot) => {
            const t = new Date(slot);
            const label = t.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: userTimezone,
            });
            const endT = new Date(t.getTime() + duration * 60000);
            const endLabel = endT.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: userTimezone,
            });
            const selected = selectedSlot === slot;

            return (
              <button
                key={slot}
                className={`slot-btn ${selected ? 'slot-btn--selected' : ''}`}
                onClick={() => onSelect(slot)}
              >
                <span className="slot-time">{label}</span>
                {selected && (
                  <span className="slot-end"> — {endLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

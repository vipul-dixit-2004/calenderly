'use client';

import { useState, useRef, useEffect } from 'react';
import { aiChat } from '@/lib/api';
import MessageFormatter from './MessageFormatter';

type Role = 'user' | 'model';
interface Message { role: Role; content: string }

const SUGGESTED_PROMPTS = [
  "What does my day look like?",
  "Do I have any meetings this week?",
  "Who is my next meeting with?",
  "How many meetings do I have scheduled?",
];

export default function ChatPanel() {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userTurn: Message = { role: 'user', content: msg };
    const next = [...history, userTurn];
    setHistory(next);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const { reply } = await aiChat(msg, history);
      setHistory([...next, { role: 'model', content: reply }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setHistory(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }}>
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '400px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>How can I help today?</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              I can help you manage your schedule, summarize upcoming events, or check your availability.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', fontWeight: 500, color: 'var(--color-text)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'model' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            )}

            <div style={{
              maxWidth: '85%', padding: '12px 16px', fontSize: '14px', lineHeight: 1.6,
              background: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg)',
              color: m.role === 'user' ? 'white' : 'var(--color-text)',
              border: m.role === 'user' ? 'none' : '1px solid var(--color-border)',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              whiteSpace: 'pre-wrap'
            }}>
              <MessageFormatter content={m.content} />
            </div>

            {m.role === 'user' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div style={{
              padding: '12px 16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
              borderRadius: '16px 16px 16px 4px', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-error)',
              background: '#FEF2F2', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            className="sched-search-input"
            style={{ flex: 1, minHeight: '44px', maxHeight: '120px', resize: 'none', padding: '12px 16px', borderRadius: '22px' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message Calenderly AI..."
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary flex justify-center items-center"
            style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', marginTop: '2px' }}>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

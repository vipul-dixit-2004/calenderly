import ChatPanel from '@/components/ai/ChatPanel';

export const metadata = { title: 'AI Assistant — Calenderly' };

export default function AssistantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[var(--color-bg-secondary)]">
      <div className="sched-page-header">
        <div className="sched-page-title-row" style={{ marginBottom: '8px' }}>
          <h1 className="sched-page-title">AI Assistant</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Ask questions about your schedule, get summaries, or send reminders to invitees.
        </p>
      </div>
      
      <div className="sched-content flex-1 min-h-0 flex flex-col pb-0">
        <div className="w-full max-w-[800px] mx-auto h-full pb-8">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

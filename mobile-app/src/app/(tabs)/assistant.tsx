import { ComingSoon } from '@/components/coming-soon';

export default function AssistantScreen() {
  return (
    <ComingSoon
      title="AI Assistant"
      features={['Ask about your schedule in plain language', 'Get help finding free time']}
    />
  );
}

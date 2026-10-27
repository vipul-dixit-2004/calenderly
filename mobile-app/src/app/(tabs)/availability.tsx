import { ComingSoon } from '@/components/coming-soon';

export default function AvailabilityScreen() {
  return (
    <ComingSoon
      title="Availability"
      features={['Your weekly working hours', 'Date-specific overrides', 'Timezone settings']}
    />
  );
}

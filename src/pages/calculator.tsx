import { ClickLeaseCalculator } from '@/components/ClickLeaseCalculator';
import { AudioController } from '@/components/AudioController';

export default function Calculator() {
  return (
    <div className="min-h-screen">
      <AudioController />
      <ClickLeaseCalculator />
    </div>
  );
}

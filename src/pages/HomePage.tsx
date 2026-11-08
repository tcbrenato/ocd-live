import type { LiveFormat } from '@/data/types';
import Hero from '@/components/Hero';

interface HomePageProps {
  onChooseFormat: (format: LiveFormat) => void;
}

export default function HomePage({ onChooseFormat }: HomePageProps) {
  return <Hero onChooseFormat={onChooseFormat} />;
}

import { useState } from 'react';
import type { LiveFormat } from '@/data/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingPage from '@/pages/BookingPage';
import HomePage from '@/pages/HomePage';

export default function App() {
  const [formatChoice, setFormatChoice] = useState<{
    format: LiveFormat;
    id: number;
  } | null>(null);

  const handleChooseFormat = (format: LiveFormat) => {
    setFormatChoice((previous) => ({
      format,
      id: (previous?.id ?? 0) + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomePage onChooseFormat={handleChooseFormat} />
      <BookingPage formatChoice={formatChoice} />
      <Footer />
    </div>
  );
}

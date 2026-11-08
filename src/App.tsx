import { useState, useEffect } from 'react';
import type { LiveFormat } from '@/data/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingPage from '@/pages/BookingPage';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/admin/AdminPage'; // Import de la page admin

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const [formatChoice, setFormatChoice] = useState<{
    format: LiveFormat;
    id: number;
  } | null>(null);

  // Écouteur pour gérer la navigation si l'URL change dynamiquement
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleChooseFormat = (format: LiveFormat) => {
    setFormatChoice((previous) => ({
      format,
      id: (previous?.id ?? 0) + 1,
    }));
  };

  // Si l'URL est /admin, on affiche uniquement le panneau d'administration
  if (currentPath === '/admin') {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomePage onChooseFormat={handleChooseFormat} />
      <BookingPage formatChoice={formatChoice} />
      <Footer />
    </div>
  );
}
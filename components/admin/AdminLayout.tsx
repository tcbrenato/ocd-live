'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export default function AdminLayout({ children, activeTab = 'reservations' }: AdminLayoutProps) {
  const navItems = [
    { id: 'overview', label: 'Vue générale', icon: '📊', href: '/admin' },
    { id: 'reservations', label: 'Réservations', icon: '📅', href: '/admin/reservations' },
    { id: 'slots', label: 'Créneaux & Horaires', icon: '⏰', href: '/admin/slots' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️', href: '/admin/settings' },
  ];

  return (
    <div className='min-h-screen bg-[#F8F9FA] font-sans text-ocd-anthracite'>
      {/* Sidebar */}
      <aside className='fixed inset-y-0 left-0 z-40 w-64 border-r border-ocd-line/60 bg-white p-6'>
        <div className='flex items-center gap-3 pb-8 border-b border-ocd-line/40'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-ocd-orange/10 text-ocd-orange font-bold'>
            O
          </div>
          <div>
            <h1 className='font-extrabold text-lg leading-tight'>OCD Live</h1>
            <span className='text-[10px] font-bold uppercase tracking-wider text-ocd-orange'>Admin Panel</span>
          </div>
        </div>

        <nav className='mt-6 flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={lex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className='pl-64'>
        <header className='sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ocd-line/60 bg-white/80 px-8 backdrop-blur-md'>
          <div className='text-sm font-medium text-ocd-anthracite/60'>
            Espace d'administration
          </div>
          <div className='flex items-center gap-4'>
            <span className='flex h-2 w-2 rounded-full bg-emerald-500' />
            <span className='text-xs font-semibold'>Admin connecté</span>
          </div>
        </header>

        <main className='p-8'>{children}</main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function AdminPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-ocd-anthracite p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-center pb-6 border-b border-ocd-line">
          <div>
            <h1 className="text-3xl font-black">Administration OCD Live</h1>
            <p className="text-sm text-ocd-anthracite/60">Gestion des créneaux et des réservations</p>
          </div>
          <a href="/" className="px-4 py-2 rounded-xl bg-ocd-anthracite text-white text-xs font-bold">
            ← Retour au site
          </a>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-ocd-line shadow-sm">
            <span className="text-xs font-bold uppercase text-ocd-anthracite/60">Total Réservations</span>
            <p className="text-3xl font-black text-ocd-orange mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-ocd-line shadow-sm">
            <span className="text-xs font-bold uppercase text-ocd-anthracite/60">Sur Place (Lomé)</span>
            <p className="text-3xl font-black text-ocd-anthracite mt-2">8</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-ocd-line shadow-sm">
            <span className="text-xs font-bold uppercase text-ocd-anthracite/60">À distance</span>
            <p className="text-3xl font-black text-blue-600 mt-2">4</p>
          </div>
        </div>
      </div>
    </div>
  );
}

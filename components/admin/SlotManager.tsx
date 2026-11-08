'use client';

import { useState } from 'react';

export default function SlotManager() {
  const [slots, setSlots] = useState([
    { id: '1', time: '10:00 - 11:30', active: true },
    { id: '2', time: '14:00 - 15:30', active: true },
    { id: '3', time: '16:00 - 17:30', active: false },
  ]);

  const toggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div className='rounded-2xl border border-ocd-line/80 bg-white p-6 shadow-sm'>
      <h3 className='text-lg font-bold text-ocd-anthracite'>Horaires types d'1h30</h3>
      <p className='text-xs text-ocd-anthracite/60 mt-1'>
        Active ou désactive les créneaux proposés lors des réservations.
      </p>

      <div className='mt-6 flex flex-col gap-3'>
        {slots.map((slot) => (
          <div
            key={slot.id}
            className='flex items-center justify-between rounded-xl border border-ocd-line/60 bg-ocd-paper/40 p-4'
          >
            <span className='font-mono text-sm font-bold text-ocd-anthracite'>{slot.time}</span>
            <button
              onClick={() => toggleSlot(slot.id)}
              className={ounded-lg px-4 py-1.5 text-xs font-bold transition-all }
            >
              {slot.active ? 'Disponible' : 'Bloqué'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

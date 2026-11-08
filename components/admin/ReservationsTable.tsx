'use client';

import { useState } from 'react';

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  productName: string;
  country: string;
  format: 'onplace' | 'remote';
  date: string;
  timeSlot: string;
  status: ReservationStatus;
}

interface Props {
  initialReservations: Reservation[];
}

export default function ReservationsTable({ initialReservations }: Props) {
  const [filterFormat, setFilterFormat] = useState<'all' | 'onplace' | 'remote'>('all');
  const [search, setSearch] = useState('');

  const filtered = initialReservations.filter((r) => {
    const matchesFormat = filterFormat === 'all' || r.format === filterFormat;
    const matchesSearch =
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.country.toLowerCase().includes(search.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setFilterFormat('all')}
            className={ounded-xl px-4 py-2 text-xs font-bold transition-all }
          >
            Tous les formats
          </button>
          <button
            onClick={() => setFilterFormat('onplace')}
            className={ounded-xl px-4 py-2 text-xs font-bold transition-all }
          >
            Sur place (Lomé)
          </button>
          <button
            onClick={() => setFilterFormat('remote')}
            className={ounded-xl px-4 py-2 text-xs font-bold transition-all }
          >
            À distance
          </button>
        </div>

        <input
          type='text'
          placeholder='Rechercher nom, produit, pays...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-72 rounded-xl border border-ocd-line/80 bg-white px-4 py-2 text-xs font-medium focus:border-ocd-orange focus:outline-none focus:ring-2 focus:ring-ocd-orange/20'
        />
      </div>

      <div className='overflow-hidden rounded-2xl border border-ocd-line/80 bg-white shadow-sm'>
        <table className='w-full text-left text-sm'>
          <thead className='border-b border-ocd-line/60 bg-ocd-paper/50 text-xs uppercase font-bold text-ocd-anthracite/60'>
            <tr>
              <th className='px-6 py-4'>Client</th>
              <th className='px-6 py-4'>Produit / Service</th>
              <th className='px-6 py-4'>Pays</th>
              <th className='px-6 py-4'>Format</th>
              <th className='px-6 py-4'>Date & Créneau</th>
              <th className='px-6 py-4'>Statut</th>
              <th className='px-6 py-4 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-ocd-line/40'>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className='px-6 py-8 text-center text-ocd-anthracite/50'>
                  Aucune réservation trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className='hover:bg-ocd-paper/30 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='font-bold text-ocd-anthracite'>{item.clientName}</div>
                    <div className='text-xs text-ocd-anthracite/60'>{item.phone}</div>
                  </td>
                  <td className='px-6 py-4 font-medium'>{item.productName}</td>
                  <td className='px-6 py-4 font-semibold'>{item.country}</td>
                  <td className='px-6 py-4'>
                    {item.format === 'onplace' ? (
                      <span className='inline-flex rounded-full bg-ocd-orange/10 px-2.5 py-1 text-[10px] font-bold text-ocd-orange'>
                        Studio Lomé
                      </span>
                    ) : (
                      <span className='inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600'>
                        À distance
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='font-semibold'>{item.date}</div>
                    <div className='text-xs text-ocd-anthracite/60'>{item.timeSlot}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex justify-end gap-2'>
                      <button className='rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors'>
                        Valider
                      </button>
                      <button className='rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors'>
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
  };

  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  return (
    <span className={inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold }>
      {labels[status]}
    </span>
  );
}

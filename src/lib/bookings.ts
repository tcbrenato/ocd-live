import { supabase } from './supabase';
import { getSlotsForDay } from '@/data/slots';
import { PACKAGES } from '@/data/packages';
import type { ReservationState } from '@/data/types';

const pad = (n: number) => String(n).padStart(2, '0');

// LomÃ© = GMT, donc on Ã©crit l'heure en UTC (Z)
function toIso(day: number, time: string) {
  const [h, m = '0'] = time.split(/[:h]/);
  return `2026-12-${pad(day)}T${pad(+h)}:${pad(+m)}:00Z`;
}

/** Index des crÃ©neaux dÃ©jÃ  pris ou fermÃ©s pour un jour (Ã  griser dans l'Ã©tape 2). */
export async function fetchBookedIndexes(day: number): Promise<number[]> {
  const { data, error } = await supabase
    .from('slots')
    .select('starts_at, is_booked, is_open')
    .gte('starts_at', toIso(day, '00:00'))
    .lt('starts_at', toIso(day, '23:59'));
  if (error || !data) return [];

  const blocked = new Set(
    data.filter((s) => s.is_booked || !s.is_open).map((s) => new Date(s.starts_at).getTime())
  );
  return getSlotsForDay(day)
    .map((s, i) => (blocked.has(new Date(toIso(day, s.startTime)).getTime()) ? i : -1))
    .filter((i) => i >= 0);
}

export async function createBooking(r: ReservationState, consent: boolean) {
  if (!r.day || r.slotIndex === null || !r.format) throw new Error('INCOMPLETE');

  const slot = getSlotsForDay(r.day)[r.slotIndex];
  const pkg = PACKAGES.find((p) => p.id === r.packageId);

  const { data: slotRow } = await supabase
    .from('slots')
    .select('id')
    .eq('starts_at', toIso(r.day, slot.startTime))
    .maybeSingle();
  if (!slotRow) { console.error('Créneau introuvable en base', toIso(r.day, slot.startTime)); throw new Error('SLOT_NOT_FOUND'); }

  const { error } = await supabase.from('bookings').insert({
    slot_id: slotRow.id,
    format: r.format === 'onplace' ? 'onsite' : 'remote',
    full_name: r.business.name,
    whatsapp: r.business.whatsapp,
    activity: r.business.activity,
    product: r.business.product,
    country: r.format === 'remote' ? r.countryIso : null,
    package_name: pkg?.name ?? null,
    price_fcfa: pkg?.priceFCFA ?? null,
    consent,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    if (error.code === '23505' || error.message.includes('indisponible')) throw new Error('SLOT_TAKEN');
    throw new Error('SERVER');
  }
}

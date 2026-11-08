import type { SlotInfo } from './types';

/** Heures de début des 7 créneaux de 1h30, à Lomé (UTC) */
const SLOT_START_HOURS: Array<{ h: number; m: number }> = [
  { h: 8, m: 0 },
  { h: 9, m: 30 },
  { h: 11, m: 0 },
  { h: 12, m: 0 + 30 },
  { h: 14, m: 0 },
  { h: 15, m: 30 },
  { h: 17, m: 0 },
];

const SLOT_DURATION_MIN = 90;

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function addMinutes(h: number, m: number, add: number): { h: number; m: number } {
  const total = h * 60 + m + add;
  return { h: Math.floor(total / 60), m: total % 60 };
}

/**
 * Génère les créneaux pour un jour donné, de façon déterministe:
 * certains créneaux sont marqués "Déjà pris" selon le jour et l'index.
 */
export function getSlotsForDay(day: number): SlotInfo[] {
  return SLOT_START_HOURS.map((start, index) => {
    const end = addMinutes(start.h, start.m, SLOT_DURATION_MIN);
    // Déterministe: un créneau est pris si (day + index) % 5 === 0 ou === 2
    const taken = (day * 7 + index * 3) % 5 === 0 || (day + index) % 7 === 3;
    return {
      index,
      startTime: formatTime(start.h, start.m),
      endTime: formatTime(end.h, end.m),
      taken,
    };
  });
}

export const SLOT_LABELS: Array<{ start: string; end: string }> =
  SLOT_START_HOURS.map((start) => {
    const end = addMinutes(start.h, start.m, SLOT_DURATION_MIN);
    return { start: formatTime(start.h, start.m), end: formatTime(end.h, end.m) };
  });

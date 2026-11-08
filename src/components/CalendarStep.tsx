import { useEffect, useMemo, useState } from 'react';
import type { SlotInfo } from '@/data/types';
import { getSlotsForDay } from '@/data/slots';
import { ISO_TO_IANA } from '@/data/countries';
import { convertLomeTimeToZone } from '@/utils/format';
import { fetchBookedIndexes } from '@/lib/bookings';

interface CalendarStepProps {
  day: number | null;
  slotIndex: number | null;
  format: 'onplace' | 'remote' | null;
  countryIso: string | null;
  onSelectDay: (day: number) => void;
  onSelectSlot: (index: number) => void;
}

// Décembre 2026: le 1er est un mardi.
// Lundi = index 0. Donc le 1er décembre est à l'index 1.
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAME = 'Décembre 2026';
const DAYS_IN_MONTH = 31;
const FIRST_DAY_OFFSET = 1; // mardi

function buildCalendarGrid(): Array<number | null> {
  const grid: Array<number | null> = [];
  for (let i = 0; i < FIRST_DAY_OFFSET; i++) grid.push(null);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) grid.push(d);
  // compléter la dernière semaine
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function SlotButton({
  slot,
  isRemote,
  localTime,
  selected,
  onClick,
}: {
  slot: SlotInfo;
  isRemote: boolean;
  localTime: string;
  selected: boolean;
  onClick: () => void;
}) {
  if (slot.taken) {
    return (
      <div
        className="flex flex-col items-start rounded-16 border border-ocd-line bg-ocd-paper px-4 py-3 text-ocd-anthracite/30"
        aria-disabled="true"
      >
        <span className="font-semibold line-through">
          {slot.startTime} – {slot.endTime}
        </span>
        <span className="text-xs">Déjà pris</span>
        {isRemote && (
          <span className="text-xs line-through">Chez toi : {localTime}</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`btn-touch flex flex-col items-start rounded-16 border-2 px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-ocd-orange bg-ocd-orange/5'
          : 'border-ocd-line hover:border-ocd-orange-light'
      }`}
    >
      <span
        className={`font-semibold ${
          selected ? 'text-ocd-orange-dark' : 'text-ocd-anthracite'
        }`}
      >
        {slot.startTime} – {slot.endTime}
      </span>
      {isRemote && (
        <span className="text-xs text-ocd-anthracite/60">Chez toi : {localTime}</span>
      )}
    </button>
  );
}

export default function CalendarStep({
  day,
  slotIndex,
  format,
  countryIso,
  onSelectDay,
  onSelectSlot,
}: CalendarStepProps) {
  const grid = useMemo(buildCalendarGrid, []);
  const [booked, setBooked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Charge les vrais créneaux pris/fermés depuis Supabase à chaque changement de jour
  useEffect(() => {
    if (!day) return;
    let cancelled = false;
    setLoading(true);
    fetchBookedIndexes(day).then((indexes) => {
      if (cancelled) return;
      setBooked(indexes);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [day]);

  // On remplace la propriété "taken" simulée par la vraie donnée de la base
  const slots = useMemo(
    () =>
      day
        ? getSlotsForDay(day).map((s) => ({ ...s, taken: booked.includes(s.index) }))
        : [],
    [day, booked],
  );

  const isRemote = format === 'remote';
  const iana = countryIso ? ISO_TO_IANA[countryIso] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Jour et heure</h2>
        <p className="mt-2 text-ocd-anthracite/60">
          Choisis un jour en décembre 2026, puis un créneau d'1h30.
        </p>
      </div>

      <div className="rounded-16 border border-ocd-line p-5 sm:p-6">
        <p className="mb-4 text-lg font-extrabold">{MONTH_NAME}</p>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="pb-2 text-center text-xs font-semibold uppercase text-ocd-anthracite/40"
            >
              {wd}
            </div>
          ))}
          {grid.map((d, i) => {
            if (d === null) return <div key={i} />;
            const selected = d === day;
            return (
              <button
                key={i}
                onClick={() => onSelectDay(d)}
                className={`btn-touch rounded-12 text-sm font-semibold transition-colors ${
                  selected
                    ? 'bg-ocd-orange text-ocd-anthracite'
                    : 'hover:bg-ocd-paper'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {day && (
        <div className="border-t border-ocd-line pt-6">
          <h3 className="text-xl">Créneaux du {day} décembre</h3>
          <p className="mt-1 text-sm text-ocd-anthracite/60">
            Heures de Lomé (UTC){isRemote ? ' · heure locale entre parenthèses' : ''}.
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-ocd-anthracite/60" role="status">
              Chargement des créneaux…
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const localTime = iana
                  ? `${convertLomeTimeToZone(slot.startTime, iana)} – ${convertLomeTimeToZone(
                      slot.endTime,
                      iana,
                    )}`
                  : '';
                return (
                  <SlotButton
                    key={slot.index}
                    slot={slot}
                    isRemote={isRemote}
                    localTime={localTime}
                    selected={slot.index === slotIndex}
                    onClick={() => onSelectSlot(slot.index)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

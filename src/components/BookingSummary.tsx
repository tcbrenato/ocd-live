import type { ReservationState } from '@/data/types';
import { PACKAGES } from '@/data/packages';
import { getCountryNameFR, formatFCFA } from '@/utils/format';
import { getSlotsForDay } from '@/data/slots';

interface BookingSummaryProps {
  reservation: ReservationState;
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span
        className={`text-right text-sm font-semibold ${
          highlight ? 'text-ocd-gold' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function BookingSummary({ reservation }: BookingSummaryProps) {
  const formatLabel =
    reservation.format === 'onplace'
      ? 'Sur place, à Lomé'
      : reservation.format === 'remote'
        ? `À distance${reservation.countryIso ? ` (${getCountryNameFR(reservation.countryIso)})` : ''}`
        : 'Non choisi';

  const slots = reservation.day ? getSlotsForDay(reservation.day) : [];
  const slot = reservation.slotIndex !== null ? slots[reservation.slotIndex] : null;
  const pkg = PACKAGES.find((p) => p.id === reservation.packageId);

  const slotValue = slot
    ? `${reservation.day} déc. · ${slot.startTime}–${slot.endTime}`
    : 'Non choisi';

  return (
    <aside
      className="sticky top-6 rounded-16 p-6"
      style={{ background: '#1E1E1E' }}
      aria-label="Ta réservation"
    >
      <p className="text-xs uppercase tracking-wider text-ocd-gold">Ta réservation</p>
      <div className="mt-4">
        <Row label="Format" value={formatLabel} />
        <Row label="Créneau" value={slotValue} />
        <Row
          label="Package"
          value={pkg ? pkg.name : 'Non choisi'}
        />
        <Row
          label="Prix"
          value={pkg ? formatFCFA(pkg.priceFCFA) : '—'}
          highlight
        />
      </div>
    </aside>
  );
}

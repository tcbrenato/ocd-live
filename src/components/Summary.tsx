import { useState } from 'react';
import type { ReservationState } from '@/data/types';
import { PACKAGES } from '@/data/packages';
import { getCountryNameFR, formatFCFA } from '@/utils/format';
import { getSlotsForDay } from '@/data/slots';
import { createBooking } from '@/lib/bookings';

interface SummaryProps {
  reservation: ReservationState;
  onEdit: () => void;
}

function buildRecapText(reservation: ReservationState): string {
  const formatLabel =
    reservation.format === 'onplace'
      ? 'Sur place, à Lomé'
      : reservation.format === 'remote'
        ? 'À distance'
        : '—';

  const countryLabel =
    reservation.format === 'remote' && reservation.countryIso
      ? getCountryNameFR(reservation.countryIso)
      : '';

  const slots = reservation.day ? getSlotsForDay(reservation.day) : [];
  const slot = reservation.slotIndex !== null ? slots[reservation.slotIndex] : null;
  const slotLabel = slot ? `${slot.startTime} – ${slot.endTime} (Lomé)` : '';

  const pkg = PACKAGES.find((p) => p.id === reservation.packageId);
  const priceLabel = pkg ? formatFCFA(pkg.priceFCFA) : '';

  const lines = [
    'OCD Live — Réservation',
    '',
    `Format : ${formatLabel}${countryLabel ? ` (${countryLabel})` : ''}`,
    `Créneau : ${reservation.day ?? '—'} décembre 2026${slotLabel ? `, ${slotLabel}` : ''}`,
    `Package : ${pkg?.name ?? '—'} — ${priceLabel}`,
    '',
    `Nom : ${reservation.business.name || '—'}`,
    `WhatsApp : ${reservation.business.whatsapp || '—'}`,
    `Activité : ${reservation.business.activity || '—'}`,
    `Produit : ${reservation.business.product || '—'}`,
  ];

  return lines.join('\n');
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ocd-line py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ocd-anthracite/40">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-ocd-anthracite">{value}</dd>
    </div>
  );
}

export default function Summary({ reservation, onEdit }: SummaryProps) {
  const [copied, setCopied] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const formatLabel =
    reservation.format === 'onplace'
      ? 'Sur place, à Lomé'
      : reservation.format === 'remote'
        ? 'À distance'
        : '—';

  const countryLabel =
    reservation.format === 'remote' && reservation.countryIso
      ? ` (${getCountryNameFR(reservation.countryIso)})`
      : '';

  const slots = reservation.day ? getSlotsForDay(reservation.day) : [];
  const slot = reservation.slotIndex !== null ? slots[reservation.slotIndex] : null;
  const pkg = PACKAGES.find((p) => p.id === reservation.packageId);

  const handleConfirm = async () => {
    setStatus('sending');
    try {
      await createBooking(reservation, consent);
      setStatus('done');
    } catch (e) {
      const code = (e as Error).message;
      setErrorMsg(
        code === 'SLOT_TAKEN'
          ? 'Ce créneau vient d’être pris. Choisis-en un autre.'
          : 'Une erreur est survenue. Réessaie dans un instant.'
      );
      setStatus('error');
    }
  };

  const handleCopy = async () => {
    const text = buildRecapText(reservation);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // échec silencieux
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Ta réservation est prête</h2>
        <p className="mt-2 text-ocd-anthracite/60">
          Vérifie le récapitulatif avant de confirmer.
        </p>
      </div>

      <dl className="rounded-16 border border-ocd-line bg-ocd-paper p-6">
        <RecapRow label="Format" value={`${formatLabel}${countryLabel}`} />
        <RecapRow
          label="Créneau"
          value={
            slot
              ? `${reservation.day} décembre 2026, ${slot.startTime} – ${slot.endTime} (Lomé)`
              : '—'
          }
        />
        <RecapRow
          label="Package"
          value={pkg ? `${pkg.name} — ${formatFCFA(pkg.priceFCFA)}` : '—'}
        />
        <RecapRow label="Nom" value={reservation.business.name || '—'} />
        <RecapRow label="WhatsApp" value={reservation.business.whatsapp || '—'} />
        <RecapRow label="Activité" value={reservation.business.activity || '—'} />
        <RecapRow label="Produit" value={reservation.business.product || '—'} />
      </dl>

      {status === 'done' ? (
        <p
          className="rounded-16 bg-ocd-paper p-4 font-semibold text-ocd-anthracite"
          role="status"
        >
          Réservation enregistrée ✅ L’équipe OCD Live te contacte sur WhatsApp.
        </p>
      ) : (
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-ocd-anthracite/70">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5"
            />
            J’accepte que mes informations (nom, WhatsApp, activité, produit) soient
            utilisées pour traiter ma réservation.
          </label>
          {status === 'error' && (
            <p className="text-sm font-semibold text-red-600" role="alert">
              {errorMsg}
            </p>
          )}
          <button
            onClick={handleConfirm}
            disabled={!consent || status === 'sending'}
            className="btn-touch w-full rounded-16 bg-ocd-orange px-6 py-4 font-extrabold text-ocd-anthracite disabled:opacity-40"
          >
            {status === 'sending' ? 'Envoi…' : 'Confirmer la réservation'}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleCopy}
          className="btn-touch flex-1 rounded-16 border-2 border-ocd-anthracite px-6 py-4 font-extrabold text-ocd-anthracite transition-colors hover:bg-ocd-anthracite hover:text-white"
          aria-live="polite"
        >
          {copied ? 'Récapitulatif copié !' : 'Copier le récapitulatif'}
        </button>
        <button
          onClick={onEdit}
          className="btn-touch flex-1 rounded-16 border-2 border-ocd-anthracite px-6 py-4 font-extrabold text-ocd-anthracite transition-colors hover:bg-ocd-anthracite hover:text-white"
        >
          Modifier
        </button>
      </div>

      <p className="rounded-16 bg-ocd-paper p-4 text-sm text-ocd-anthracite/70">
        Tu peux aussi envoyer ce récapitulatif sur WhatsApp.
      </p>
    </div>
  );
}

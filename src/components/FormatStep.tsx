import type { LiveFormat } from '@/data/types';
import AfricaMap from './AfricaMap';
import { getCountryNameFR } from '@/utils/format';

interface FormatStepProps {
  format: LiveFormat | null;
  countryIso: string | null;
  onSelectFormat: (format: LiveFormat) => void;
  onSelectCountry: (iso: string) => void;
}

interface FormatCardProps {
  id: LiveFormat;
  title: string;
  subtitle: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  variant: 'orange' | 'dark';
}

function FormatCard({
  title,
  subtitle,
  description,
  selected,
  onClick,
  variant,
}: Omit<FormatCardProps, 'id'>) {
  const base =
    'btn-touch flex flex-col items-start rounded-16 border-2 p-6 text-left transition-all';
  const styles =
    variant === 'orange'
      ? selected
        ? 'border-ocd-orange bg-ocd-orange/5'
        : 'border-ocd-line hover:border-ocd-orange-light'
      : selected
        ? 'border-ocd-anthracite bg-ocd-anthracite/5'
        : 'border-ocd-line hover:border-ocd-anthracite/50';

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      <span
        className={`text-lg font-extrabold ${
          variant === 'orange' ? 'text-ocd-orange-dark' : 'text-ocd-anthracite'
        }`}
      >
        {title}
      </span>
      <span className="mt-1 text-sm font-semibold text-ocd-anthracite/60">
        {subtitle}
      </span>
      <span className="mt-3 text-sm text-ocd-anthracite/70">{description}</span>
    </button>
  );
}

export default function FormatStep({
  format,
  countryIso,
  onSelectFormat,
  onSelectCountry,
}: FormatStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Choisis ton format</h2>
        <p className="mt-2 text-ocd-anthracite/60">
          Tu peux venir au studio à Lomé ou faire ton live depuis ton pays.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormatCard
          title="Sur place, à Lomé"
          subtitle="Tu viens au studio"
          description="Une régie dirige ton live."
          selected={format === 'onplace'}
          onClick={() => onSelectFormat('onplace')}
          variant="orange"
        />
        <FormatCard
          title="À distance"
          subtitle="Depuis chez toi ou ta boutique"
          description="Une assistante t'accompagne depuis Lomé."
          selected={format === 'remote'}
          onClick={() => onSelectFormat('remote')}
          variant="dark"
        />
      </div>

      {format === 'remote' && (
        <div className="mt-8 border-t border-ocd-line pt-8">
          <h3 className="text-xl">Choisis ton pays</h3>
          <p className="mt-1 text-sm text-ocd-anthracite/60">
            Sélectionne ton pays pour voir l'heure locale et les créneaux adaptés.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AfricaMap selectedIso={countryIso} onSelect={onSelectCountry} />

            <div className="flex flex-col gap-4">
              {countryIso && (
                <div className="rounded-16 border-2 border-ocd-orange bg-ocd-paper p-6">
                  <p className="text-xs uppercase tracking-wider text-ocd-orange-dark">
                    Pays choisi
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {getCountryNameFR(countryIso)}
                  </p>
                </div>
              )}
              <p className="text-sm text-ocd-anthracite/60">
                Clique sur un pays sur la carte pour le sélectionner.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

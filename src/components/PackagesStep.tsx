import { PACKAGES, PACKAGES_TARIFF_NOTE } from '@/data/packages';
import { formatFCFA } from '@/utils/format';

interface PackagesStepProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PackagesStep({ selectedId, onSelect }: PackagesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Choisis ton package</h2>
        <p className="mt-2 text-ocd-anthracite/60">
          Sélectionne la formule qui te convient.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((pkg) => {
          const selected = pkg.id === selectedId;
          return (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className={`btn-touch flex flex-col items-start rounded-16 border-2 p-5 text-left transition-all ${
                selected
                  ? 'border-ocd-orange bg-ocd-orange/5'
                  : 'border-ocd-line hover:border-ocd-orange-light'
              }`}
            >
              <span
                className={`text-base font-extrabold ${
                  selected ? 'text-ocd-orange-dark' : 'text-ocd-anthracite'
                }`}
              >
                {pkg.name}
              </span>
              <span className="mt-2 flex-1 text-sm text-ocd-anthracite/70">
                {pkg.description}
              </span>
              <span className="mt-4 text-lg font-extrabold text-ocd-anthracite">
                {formatFCFA(pkg.priceFCFA)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs italic text-ocd-anthracite/50">{PACKAGES_TARIFF_NOTE}</p>
    </div>
  );
}

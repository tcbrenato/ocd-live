import type { LiveFormat } from '@/data/types';

interface HeroProps {
  onChooseFormat: (format: LiveFormat) => void;
}

function LogoBlock() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-16 bg-ocd-paper p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center justify-center text-5xl font-extrabold tracking-tightish sm:text-6xl md:text-7xl">
          <span className="text-ocd-orange">OCD</span>
          <span className="text-ocd-anthracite">Live</span>
        </div>
        <div className="h-px w-24 bg-ocd-line" />
        <p className="max-w-xs text-sm text-ocd-anthracite/60">
          Opportunités C'est Dehors
        </p>
      </div>
    </div>
  );
}

export default function Hero({ onChooseFormat }: HeroProps) {
  return (
    <section id="accueil" className="border-b border-ocd-line bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-16">
        {/* Colonne gauche */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-ocd-orange-dark">
              Lives de vente · Bovann
            </p>
            <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Ton live commence dehors.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ocd-anthracite/70">
              Réserve un créneau d'1h30 et présente ton produit au public des OCD.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => onChooseFormat('onplace')}
              className="btn-touch group flex flex-1 flex-col items-start rounded-16 bg-ocd-orange px-6 py-5 text-left transition-colors hover:bg-ocd-orange-light focus-visible:outline-ocd-orange"
            >
              <span className="text-lg font-extrabold text-ocd-anthracite">
                Sur place, à Lomé
              </span>
              <span className="mt-1 text-sm font-semibold text-ocd-anthracite/70">
                Tu viens au studio
              </span>
            </button>

            <button
              onClick={() => onChooseFormat('remote')}
              className="btn-touch group flex flex-1 flex-col items-start rounded-16 bg-ocd-anthracite px-6 py-5 text-left transition-colors hover:bg-black focus-visible:outline-ocd-orange"
            >
              <span className="text-lg font-extrabold text-white">À distance</span>
              <span className="mt-1 text-sm font-semibold text-white/60">
                Depuis ton pays
              </span>
            </button>
          </div>
        </div>

        {/* Colonne droite */}
        <LogoBlock />
      </div>
    </section>
  );
}

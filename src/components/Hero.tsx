import type { LiveFormat } from '@/data/types';

interface HeroProps {
  onChooseFormat: (format: LiveFormat) => void;
}

function LogoCard() {
  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl shadow-black/40 sm:p-3">
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-[1.5rem] bg-white p-8 text-center">
        <img
          src="/logoocd.jpg"
          alt="Logo OCD Live"
          className="h-40 w-auto max-w-full object-contain sm:h-52 lg:h-56"
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-ocd-anthracite/50">
          Opportunités C'est Dehors
        </p>
      </div>
    </div>
  );
}

export default function Hero({ onChooseFormat }: HeroProps) {
  return (
    <section
      id="accueil"
      className="relative overflow-hidden bg-gradient-to-br from-black via-ocd-anthracite to-ocd-anthracite"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-28">
        {/* Colonne gauche */}
        <div>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Ton live
            <br />
            commence
            <br />
            <span className="text-ocd-orange">dehors.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            Réserve un créneau d'1h30 et présente ton produit au public des OCD.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onChooseFormat('onplace')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-ocd-anthracite shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-ocd-paper active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocd-orange"
            >
              Sur place, à Lomé
              <span aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              onClick={() => onChooseFormat('remote')}
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/5 px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocd-orange"
            >
              À distance
            </button>
          </div>

          <p className="mt-4 text-sm text-white/50">
            Sur place : tu viens au studio · À distance : depuis ton pays
          </p>
        </div>

        {/* Colonne droite */}
        <LogoCard />
      </div>
    </section>
  );
}
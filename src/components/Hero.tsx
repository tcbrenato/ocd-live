import type { LiveFormat } from '@/data/types';

interface HeroProps {
  onChooseFormat: (format: LiveFormat) => void;
}

function LogoBlock() {
  return (
    <div className="relative flex h-full min-h-[380px] w-full items-center justify-center overflow-hidden rounded-3xl border border-ocd-line/80 bg-gradient-to-br from-ocd-paper/60 via-white to-ocd-paper/40 p-8 shadow-sm">
      {/* Halo lumineux d'ambiance en arrière-plan */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-ocd-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-ocd-anthracite/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="group relative flex items-center justify-center rounded-2xl bg-white p-6 shadow-md shadow-black/5 ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.02]">
          <img
            src="/logoocd.jpg"
            alt="Logo OCD Live"
            className="h-36 w-auto max-w-full object-contain sm:h-48 md:h-56"
          />
        </div>

        <div className="my-6 h-px w-16 bg-gradient-to-r from-transparent via-ocd-line to-transparent" />

        <p className="max-w-xs text-xs font-semibold uppercase tracking-widest text-ocd-anthracite/50">
          Opportunités C'est Dehors
        </p>
      </div>
    </div>
  );
}

export default function Hero({ onChooseFormat }: HeroProps) {
  return (
    <section id="accueil" className="relative overflow-hidden border-b border-ocd-line bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-20">
        {/* Colonne gauche */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ocd-orange/20 bg-ocd-orange/10 px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocd-orange opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ocd-orange"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ocd-orange-dark">
                Lives de vente · Bovann
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-ocd-anthracite sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              Ton live commence <span className="text-ocd-orange">dehors.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ocd-anthracite/75">
              Réserve un créneau de{' '}
              <strong className="font-semibold text-ocd-anthracite">1h30</strong> et présente
              directement ton produit à la communauté OCD.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onChooseFormat('onplace')}
              className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-ocd-orange p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-ocd-orange-dark hover:shadow-lg hover:shadow-ocd-orange/20 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocd-orange"
            >
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-ocd-anthracite/60">
                  Option 01
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-ocd-anthracite">
                  Sur place, à Lomé
                </h3>
                <p className="mt-1 text-sm font-medium text-ocd-anthracite/80">
                  Tu viens directement au studio
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-ocd-anthracite">
                <span>Sélectionner</span>
                <svg
                  className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChooseFormat('remote')}
              className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-ocd-anthracite p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-black hover:shadow-lg hover:shadow-black/20 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocd-anthracite"
            >
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-white/50">
                  Option 02
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-white">À distance</h3>
                <p className="mt-1 text-sm font-medium text-white/70">
                  Depuis ton pays ou chez toi
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-ocd-orange">
                <span>Sélectionner</span>
                <svg
                  className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Colonne droite */}
        <LogoBlock />
      </div>
    </section>
  );
}
export default function Footer() {
  return (
    <footer className="border-t border-ocd-line">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <a
            href="#accueil"
            className="text-xl font-extrabold tracking-tightish"
            aria-label="OCD Live — accueil"
          >
            <span className="text-ocd-orange">OCD</span>
            <span className="text-ocd-anthracite">Live</span>
          </a>
          <p className="text-sm text-ocd-anthracite/50">
            OCD — Opportunités C&apos;est Dehors · Bovann
          </p>
        </div>
      </div>
    </footer>
  );
}

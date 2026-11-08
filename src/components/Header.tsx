export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ocd-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"
        aria-label="Navigation principale"
      >
        <a
          href="#accueil"
          className="flex items-center gap-3 text-2xl font-extrabold tracking-tightish"
          aria-label="OCD Live — accueil"
        >
          <img
            src="/logoocd.jpg"
            alt="Logo OCD"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-ocd-anthracite">Live</span>
        </a>

        <a
          href="#reservation"
          className="inline-flex items-center rounded-full bg-ocd-orange px-5 py-2 text-sm font-semibold text-ocd-anthracite transition-colors hover:bg-ocd-orange-dark hover:text-white"
        >
          Réserver
        </a>
      </nav>
    </header>
  );
}
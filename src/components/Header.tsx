export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ocd-line/60 bg-white/85 backdrop-blur-md transition-all">
      <nav
        className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <a
          href="#accueil"
          className="group flex items-center gap-2 text-2xl font-black tracking-tight"
          aria-label="OCD Live — accueil"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocd-orange/10 text-ocd-orange transition-transform duration-300 group-hover:scale-105">
            <span className="font-extrabold">O</span>
          </span>
          <span className="flex items-baseline">
            <span className="text-ocd-orange">OCD</span>
            <span className="ml-1 text-ocd-anthracite font-semibold">Live</span>
          </span>
        </a>

        {/* Actions / Navigation */}
        <div className="flex items-center gap-4">
          <a
            href="#reservation"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-ocd-orange px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-ocd-orange-dark hover:shadow-md active:scale-95"
          >
            Réserver
          </a>
        </div>
      </nav>
    </header>
  );
}
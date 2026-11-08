export default function Header() {
  return (
    <header className="border-b border-ocd-line bg-white">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"
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
          className="hidden text-sm font-semibold text-ocd-orange-dark transition-colors hover:text-ocd-orange sm:block"
        >
          Réserver
        </a>
      </nav>
    </header>
  );
}
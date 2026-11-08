import Image from 'next/image';

// Pour utiliser l'image importée comme source, vous devez l'avoir dans votre dossier public/ (ex: public/logoocd.jpg)
import logoOcd from './public/logoocd.jpg'; 

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
          {/* Logo remplacé par l'image */}
          <Image 
            src={logoOcd} 
            alt="Logo OCD" 
            width={40} // Ajustez la largeur selon vos besoins
            height={40} // Ajustez la hauteur selon vos besoins
            priority // Chargez le logo en priorité car c'est un élément clé
            className="h-10 w-auto" // Classe Tailwind pour contrôler la taille
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import worldData from 'world-atlas/countries-50m.json';
import { AFRICAN_ISO_SET, ISO_TO_IANA, TOGO_ISO } from '@/data/countries';
import { getCountryNameFR, formatCurrentTime } from '@/utils/format';

interface AfricaMapProps {
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}

interface CountryFeatureProps {
  id: string;
  name: string;
  isAfrican: boolean;
  isTogo: boolean;
  isSelected: boolean;
  pathD: string;
  onSelect: (iso: string) => void;
  onHover: (iso: string | null) => void;
}

type CountryProps = { name?: string };

// Les 54 pays africains + Sahara occidental (codes numériques ISO)
const AFRICA_IDS = new Set([
  '012', '024', '204', '072', '854', '108', '132', '120', '140', '148',
  '174', '178', '180', '384', '262', '818', '226', '232', '748', '231',
  '266', '270', '288', '324', '624', '404', '426', '430', '434', '450',
  '454', '466', '478', '480', '504', '508', '516', '562', '566', '646',
  '678', '686', '690', '694', '706', '710', '728', '729', '834', '768',
  '788', '800', '894', '716', '732',
]);

const isAfricanId = (id: string) => AFRICA_IDS.has(id) || AFRICAN_ISO_SET.has(id);

// Territoires sans identifiant dans la carte du monde
const ID_FALLBACK_BY_NAME: Record<string, string> = {
  Somaliland: '706', // fait partie de la Somalie
};

// Antarctique : masqué
const HIDDEN_IDS = new Set(['010']);

function getFeatureId(f: Feature<Geometry, CountryProps>): string {
  if (f.id !== undefined && f.id !== null) return String(f.id);
  const name = f.properties?.name ?? '';
  return ID_FALLBACK_BY_NAME[name] ?? '';
}

// Nom français si disponible, sinon nom de la carte
function getLabel(id: string, fallback: string): string {
  const fr = getCountryNameFR(id);
  return fr && fr !== id ? fr : fallback || id;
}

function CountryFeature({
  id,
  name,
  isAfrican,
  isTogo,
  isSelected,
  pathD,
  onSelect,
  onHover,
}: CountryFeatureProps) {
  if (!pathD) return null;

  let fill = '#1F242D'; // Reste du monde très sombre
  if (isAfrican) fill = '#E2DDD5'; // Sable doux pour l'Afrique
  if (isTogo) fill = '#F26A04'; // Togo en orange signature OCD
  if (isSelected) fill = '#FF8226'; // Sélectionné en orange lumineux

  const stroke = isSelected || isTogo ? '#FFFFFF' : isAfrican ? '#C8C0B5' : '#2A2A2A';
  const strokeWidth = isSelected ? 2 : isTogo ? 1.5 : 0.5;

  return (
    <path
      d={pathD}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className={isAfrican ? 'transition-all duration-200 hover:brightness-110' : ''}
      style={{ cursor: isAfrican ? 'pointer' : 'default' }}
      onClick={() => isAfrican && onSelect(id)}
      onMouseEnter={() => isAfrican && onHover(id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => isAfrican && onHover(id)}
      onBlur={() => onHover(null)}
      tabIndex={isAfrican ? 0 : undefined}
      role={isAfrican ? 'button' : undefined}
      aria-label={isAfrican ? `Pays : ${name}` : undefined}
      onKeyDown={(e) => {
        if (isAfrican && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(id);
        }
      }}
    />
  );
}

export default function AfricaMap({ selectedIso, onSelect }: AfricaMapProps) {
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500);

  // Horloge : tick chaque seconde
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Largeur responsive du conteneur de carte
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const height = Math.round(width * 1.05);

  const { features, pathGen } = useMemo(() => {
    const topo = worldData as unknown as Topology;
    const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<
      Geometry,
      CountryProps
    >;

    const all = fc.features.filter((f) => !HIDDEN_IDS.has(getFeatureId(f)));

    const africanFeatures = all.filter((f) => isAfricanId(getFeatureId(f)));
    const collection: FeatureCollection<Geometry, CountryProps> = {
      type: 'FeatureCollection',
      features: africanFeatures,
    };

    const pad = 12;
    const proj = geoMercator().fitExtent(
      [
        [pad, pad],
        [width - pad, height - pad],
      ],
      collection,
    );
    proj.clipExtent([
      [0, 0],
      [width, height],
    ]);

    return { features: all, pathGen: geoPath(proj) };
  }, [width, height]);

  // Liste des pays africains triée A → Z en français
  const countryOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of features) {
      const id = getFeatureId(f);
      if (!id || !isAfricanId(id) || map.has(id)) continue;
      map.set(id, getLabel(id, f.properties?.name ?? ''));
    }
    const collator = new Intl.Collator('fr', { sensitivity: 'base' });
    return Array.from(map, ([iso, label]) => ({ iso, label })).sort((a, b) =>
      collator.compare(a.label, b.label),
    );
  }, [features]);

  const activeIso = hoveredIso ?? selectedIso;
  const activeIana = activeIso ? ISO_TO_IANA[activeIso] : null;
  const activeName = activeIso
    ? getLabel(activeIso, countryOptions.find((c) => c.iso === activeIso)?.label ?? '')
    : null;
  const isTogoActive = activeIso === TOGO_ISO;

  return (
    <div className="w-full">
      {/* Grille principale 2 colonnes sur grand écran */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        
        {/* Colonne Gauche : La carte interactive (7 colonnes) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ocd-anthracite/60">
              Carte interactive
            </span>
            <span className="text-xs text-ocd-anthracite/50">
              Survole ou clique sur un pays
            </span>
          </div>

          <div
            ref={containerRef}
            className="w-full overflow-hidden rounded-3xl bg-[#14171F] p-4 shadow-xl ring-1 ring-black/5"
          >
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="mx-auto block"
              role="group"
              aria-label="Carte de l'Afrique"
            >
              {features.map((f: Feature<Geometry, CountryProps>, index: number) => {
                const id = getFeatureId(f);
                const isAfrican = isAfricanId(id);
                const isTogo = id === TOGO_ISO;
                const isSelected = id !== '' && id === selectedIso;
                const pathD = pathGen(f) ?? '';
                const name = getLabel(id, f.properties?.name ?? '');
                return (
                  <CountryFeature
                    key={`${id || 'x'}-${index}`}
                    id={id}
                    name={name}
                    isAfrican={isAfrican}
                    isTogo={isTogo}
                    isSelected={isSelected}
                    pathD={pathD}
                    onSelect={onSelect}
                    onHover={setHoveredIso}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Colonne Droite : Sélection et Fiche Pays (5 colonnes) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Bloc de sélection par menu déroulant */}
          <div className="rounded-2xl border border-ocd-line/80 bg-white p-5 shadow-sm">
            <label
              htmlFor="country-select"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-ocd-anthracite/70"
            >
              Choisis ton pays de participation
            </label>
            <div className="relative">
              <select
                id="country-select"
                value={selectedIso ?? ''}
                onChange={(e) => {
                  if (e.target.value) onSelect(e.target.value);
                }}
                className="w-full appearance-none rounded-xl border border-ocd-line bg-ocd-paper/50 px-4 py-3.5 pr-10 text-sm font-semibold text-ocd-anthracite transition-all focus:border-ocd-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocd-orange/20"
              >
                <option value="">Sélectionner dans la liste…</option>
                {countryOptions.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ocd-anthracite/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Fiche Pays Dynamique */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1E29] to-[#12151B] p-6 text-white shadow-xl ring-1 ring-white/10">
            {/* Effet lumineux d'ambiance */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ocd-orange/15 blur-2xl" />

            {activeName ? (
              <div className="relative z-10 flex flex-col gap-5">
                <div>
                  <span className="inline-block rounded-full bg-ocd-orange/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ocd-orange">
                    {selectedIso === activeIso ? 'Pays sélectionné' : 'Survol en cours'}
                  </span>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                    {activeName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <div className="rounded-xl bg-white/5 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ocd-orange">
                      Heure locale
                    </p>
                    <p className="mt-1 font-mono text-base font-bold tabular-nums text-white" aria-live="polite">
                      {activeIana ? formatCurrentTime(activeIana, now) : '--:--:--'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Heure à Lomé
                    </p>
                    <p className="mt-1 font-mono text-base font-bold tabular-nums text-white" aria-live="polite">
                      {formatCurrentTime('Africa/Lome', now)}
                    </p>
                  </div>
                </div>

                {isTogoActive && (
                  <div className="flex items-center gap-2 rounded-xl bg-ocd-orange/10 p-3 text-xs font-medium text-ocd-orange border border-ocd-orange/20">
                    <span className="flex h-2 w-2 rounded-full bg-ocd-orange animate-ping" />
                    <span>Le studio OCD Live est basé ici, à Lomé !</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 py-6 text-center">
                <p className="text-sm font-medium text-white/60">
                  Sélectionne un pays dans le menu ou clique directement sur la carte pour afficher ses informations.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
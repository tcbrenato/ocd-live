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

const isAfricanId = (id: string, name?: string) =>
  AFRICA_IDS.has(id) || AFRICAN_ISO_SET.has(id) || name === 'Togo' || name === 'Cameroon';

// Territoires sans identifiant dans la carte du monde
const ID_FALLBACK_BY_NAME: Record<string, string> = {
  Somaliland: '706',
  Togo: TOGO_ISO,
};

// Antarctique : masqué
const HIDDEN_IDS = new Set(['010']);

function getFeatureId(f: Feature<Geometry, CountryProps>): string {
  const name = f.properties?.name ?? '';
  if (name === 'Togo') return TOGO_ISO;
  if (f.id !== undefined && f.id !== null) return String(f.id);
  return ID_FALLBACK_BY_NAME[name] ?? '';
}

// Nom français si disponible, sinon nom de la carte
function getLabel(id: string, fallback: string): string {
  if (id === TOGO_ISO || fallback === 'Togo') return 'Togo';
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

  let fill = '#1F242D'; // Reste du monde
  if (isAfrican) fill = '#E2DDD5'; // Sable doux pour l'Afrique
  if (isTogo) fill = '#F26A04'; // Togo en orange
  if (isSelected) fill = '#FF8226'; // Sélectionné

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
  const [width, setWidth] = useState(400);

  // Horloge : tick chaque seconde
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Largeur responsive
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

    const africanFeatures = all.filter((f) => isAfricanId(getFeatureId(f), f.properties?.name));
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
      const name = f.properties?.name;
      if (!id || !isAfricanId(id, name) || map.has(id)) continue;
      map.set(id, getLabel(id, name ?? ''));
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
    <div className="flex w-full min-w-0 flex-col gap-5">
      {/* 1. Liste déroulante */}
      <div>
        <label
          htmlFor="country-select"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-ocd-anthracite/70"
        >
          Choisis ton pays
        </label>
        <div className="relative">
          <select
            id="country-select"
            value={selectedIso ?? ''}
            onChange={(e) => {
              if (e.target.value) onSelect(e.target.value);
            }}
            className="w-full appearance-none rounded-xl border border-ocd-line bg-white px-4 py-3.5 pr-10 text-base font-semibold text-ocd-anthracite shadow-sm transition-all focus:border-ocd-orange focus:outline-none focus:ring-2 focus:ring-ocd-orange/20"
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

      {/* 2. Carte */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-3xl bg-[#14171F] p-3 shadow-xl ring-1 ring-black/5"
      >
        <svg
          width={Math.max(width - 24, 0)}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          role="group"
          aria-label="Carte de l'Afrique"
        >
          {features.map((f: Feature<Geometry, CountryProps>, index: number) => {
            const id = getFeatureId(f);
            const name = f.properties?.name;
            const isAfrican = isAfricanId(id, name);
            const isTogo = id === TOGO_ISO || name === 'Togo';
            const isSelected =
              (id !== '' && id === selectedIso) || (selectedIso === TOGO_ISO && isTogo);
            const pathD = pathGen(f) ?? '';
            const countryName = getLabel(id, name ?? '');

            return (
              <CountryFeature
                key={`${id || 'x'}-${index}`}
                id={id === '' && name === 'Togo' ? TOGO_ISO : id}
                name={countryName}
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

      {/* 3. Fiche pays */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1E29] to-[#12151B] p-5 text-white shadow-xl ring-1 ring-white/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ocd-orange/15 blur-2xl" />

        {activeName ? (
          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <span className="inline-block rounded-full bg-ocd-orange/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ocd-orange">
                {selectedIso === activeIso ? 'Pays sélectionné' : 'Survol en cours'}
              </span>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                {activeName}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 min-[420px]:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ocd-orange">
                  Heure locale
                </p>
                <p
                  className="mt-1 font-mono text-base font-bold tabular-nums text-white"
                  aria-live="polite"
                >
                  {activeIana ? formatCurrentTime(activeIana, now) : '--:--:--'}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Heure à Lomé
                </p>
                <p
                  className="mt-1 font-mono text-base font-bold tabular-nums text-white"
                  aria-live="polite"
                >
                  {formatCurrentTime('Africa/Lome', now)}
                </p>
              </div>
            </div>

            {isTogoActive && (
              <div className="flex items-center gap-2 rounded-xl border border-ocd-orange/20 bg-ocd-orange/10 p-3 text-xs font-medium text-ocd-orange">
                <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-ocd-orange" />
                <span>Le studio OCD Live est basé ici, à Lomé !</span>
              </div>
            )}
          </div>
        ) : (
          <p className="relative z-10 py-4 text-center text-sm font-medium text-white/60">
            Choisis un pays dans la liste ou touche-le sur la carte.
          </p>
        )}
      </div>
    </div>
  );
}
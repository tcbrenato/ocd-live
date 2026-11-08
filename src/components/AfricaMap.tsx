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

  let fill = '#2A2A2A'; // reste du monde
  if (isAfrican) fill = '#E6E0D8'; // sable
  if (isTogo) fill = '#F26A04'; // Togo en orange
  if (isSelected) fill = '#FF8226'; // sélectionné

  const stroke = isSelected || isTogo ? '#FFFFFF' : isAfrican ? '#3A3A3A' : '#333333';
  const strokeWidth = isSelected ? 1.8 : isTogo ? 1.4 : 0.5;

  return (
    <path
      d={pathD}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className={isAfrican ? 'transition-colors duration-150' : ''}
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
  const [width, setWidth] = useState(640);

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

    const africanFeatures = all.filter((f) => isAfricanId(getFeatureId(f)));
    const collection: FeatureCollection<Geometry, CountryProps> = {
      type: 'FeatureCollection',
      features: africanFeatures,
    };

    const pad = 16;
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

  const activeIso = hoveredIso ?? selectedIso;
  const activeIana = activeIso ? ISO_TO_IANA[activeIso] : null;
  const activeName = activeIso ? getCountryNameFR(activeIso) : null;
  const isTogoActive = activeIso === TOGO_ISO;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-16 bg-[#1E1E1E]"
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label="Carte de l'Afrique"
        >
          {features.map((f: Feature<Geometry, CountryProps>, index: number) => {
            const id = getFeatureId(f);
            const isAfrican = isAfricanId(id);
            const isTogo = id === TOGO_ISO;
            const isSelected = id !== '' && id === selectedIso;
            const pathD = pathGen(f) ?? '';
            const name = f.properties?.name ?? (id ? getCountryNameFR(id) : '');
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

      {/* Fiche pays */}
      <div className="mt-4 rounded-16 bg-[#1E1E1E] p-6 text-[#F7F5F2]">
        {activeName ? (
          <>
            <h3 className="text-2xl font-extrabold tracking-tightish text-white">
              {activeName}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-ocd-gold">
                  Heure locale
                </p>
                <p className="font-mono text-lg tabular-nums text-white" aria-live="polite">
                  {activeIana ? formatCurrentTime(activeIana, now) : '--:--:--'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ocd-gold">
                  Heure à Lomé
                </p>
                <p className="font-mono text-lg tabular-nums text-white" aria-live="polite">
                  {formatCurrentTime('Africa/Lome', now)}
                </p>
              </div>
            </div>
            {isTogoActive && (
              <p className="mt-4 text-sm text-ocd-gold">
                Le studio OCD Live est ici, à Lomé.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ocd-sand">
            Survole ou touche un pays pour l'explorer.
          </p>
        )}
      </div>
    </div>
  );
}
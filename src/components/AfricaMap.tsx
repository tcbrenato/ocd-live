import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import worldData from 'world-atlas/countries-110m.json';
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
  const strokeWidth = isSelected ? 1.8 : isTogo ? 1.4 : 0.4;

  return (
    <path
      d={pathD}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
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

  // Tick horloge chaque seconde
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Largeur responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Préparation des features et du générateur de chemins SVG
  const { features, pathGen } = useMemo(() => {
    const topo = worldData as unknown as Topology;
    const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<
      Geometry,
      { name?: string }
    >;

    // Projection Mercator ajustée à l'Afrique
    const africanFeatures = fc.features.filter((f) =>
      AFRICAN_ISO_SET.has(String(f.id)),
    );
    const collection: FeatureCollection<Geometry, { name?: string }> = {
      type: 'FeatureCollection',
      features: africanFeatures,
    };

    const proj = geoMercator().fitExtent(
      [
        [20, 20],
        [width - 20, width * 0.95],
      ],
      collection,
    );
    const path = geoPath(proj);

    return { features: fc.features, pathGen: path };
  }, [width]);

  const activeIso = hoveredIso ?? selectedIso;
  const activeIana = activeIso ? ISO_TO_IANA[activeIso] : null;
  const activeName = activeIso ? getCountryNameFR(activeIso) : null;
  const isTogoActive = activeIso === TOGO_ISO;

  const height = width * 0.95;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-16"
        style={{ background: '#1E1E1E' }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label="Carte de l'Afrique"
        >
          {features.map((f: Feature<Geometry, { name?: string }>) => {
            const id = String(f.id);
            const isAfrican = AFRICAN_ISO_SET.has(id);
            const isTogo = id === TOGO_ISO;
            const isSelected = id === selectedIso;
            const pathD = pathGen(f) ?? '';
            const name = f.properties?.name ?? getCountryNameFR(id);
            return (
              <CountryFeature
                key={id}
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
      <div
        className="mt-4 rounded-16 p-6"
        style={{ background: '#1E1E1E', color: '#F7F5F2' }}
      >
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
                <p
                  className="font-mono text-lg tabular-nums text-white"
                  aria-live="polite"
                >
                  {activeIana ? formatCurrentTime(activeIana, now) : '--:--:--'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ocd-gold">
                  Heure à Lomé
                </p>
                <p
                  className="font-mono text-lg tabular-nums text-white"
                  aria-live="polite"
                >
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

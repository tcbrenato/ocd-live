/**
 * Utilitaires de formatage et fuseaux horaires.
 */

/** Formate un prix en FCFA avec séparateurs de milliers (espaces insécables) */
export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR').replace(/\u202f/g, ' ')} FCFA`;
}

/**
 * Convertit une heure "hh:mm" (heure de Lomé/UTC) en heure locale du fuseau IANA.
 * Retourne "hh:mm" dans le fuseau cible.
 */
export function convertLomeTimeToZone(
  lomeTime: string,
  iana: string,
  referenceDate: Date = new Date('2026-12-15T00:00:00Z'),
): string {
  const [h, m] = lomeTime.split(':').map(Number);
  // Construire une Date UTC correspondant à l'heure de Lomé (UTC)
  const utcDate = new Date(referenceDate);
  utcDate.setUTCHours(h, m, 0, 0);

  try {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: iana,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(utcDate);
  } catch {
    return lomeTime;
  }
}

/** Récupère le nom d'un pays en français à partir de son code ISO numeric */
const countryNameCache = new Map<string, string>();

export function getCountryNameFR(iso: string): string {
  if (countryNameCache.has(iso)) return countryNameCache.get(iso)!;

  // Conversion ISO numeric -> ISO alpha-2 pour Intl.DisplayNames
  const alpha2 = numericToAlpha2(iso);
  let name = `Pays ${iso}`;
  try {
    const displayNames = new Intl.DisplayNames(['fr'], { type: 'region' });
    const resolved = displayNames.of(alpha2);
    if (resolved) name = resolved;
  } catch {
    // fallback
  }
  countryNameCache.set(iso, name);
  return name;
}

/** Affiche l'heure actuelle dans un fuseau IANA, mise à jour chaque seconde */
export function formatCurrentTime(iana: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: iana,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
  } catch {
    return '--:--:--';
  }
}

// Table de conversion ISO 3166-1 numeric -> alpha-2 pour les pays africains
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '012': 'DZ',
  '024': 'AO',
  '204': 'BJ',
  '072': 'BW',
  '854': 'BF',
  '108': 'BI',
  '132': 'CM',
  '140': 'CF',
  '148': 'TD',
  '174': 'KM',
  '178': 'CG',
  '180': 'CD',
  '384': 'CI',
  '262': 'DJ',
  '818': 'EG',
  '226': 'GQ',
  '232': 'ER',
  '748': 'SZ',
  '231': 'ET',
  '266': 'GA',
  '270': 'GM',
  '288': 'GH',
  '324': 'GN',
  '624': 'GW',
  '404': 'KE',
  '426': 'LS',
  '430': 'LR',
  '434': 'LY',
  '450': 'MG',
  '454': 'MW',
  '466': 'ML',
  '478': 'MR',
  '480': 'MU',
  '504': 'MA',
  '508': 'MZ',
  '516': 'NA',
  '562': 'NE',
  '566': 'NG',
  '646': 'RW',
  '678': 'ST',
  '686': 'SN',
  '690': 'SC',
  '694': 'SL',
  '706': 'SO',
  '710': 'ZA',
  '728': 'SS',
  '729': 'SD',
  '732': 'EH',
  '788': 'TN',
  '800': 'UG',
  '834': 'TZ',
  '894': 'ZM',
  '716': 'ZW',
  '768': 'TG',
};

function numericToAlpha2(numeric: string): string {
  return NUMERIC_TO_ALPHA2[numeric] ?? 'TG';
}

import type { CountryInfo } from './types';

/**
 * Code ISO numeric du Togo dans le fichier countries-110m.json de world-atlas.
 */
export const TOGO_ISO = '768';

/**
 * Pays authentiquement africains avec leur code ISO numeric (world-atlas)
 * et leur fuseau IANA.
 */
export const AFRICAN_COUNTRIES: CountryInfo[] = [
  { iso: '012', iana: 'Africa/Algiers' },
  { iso: '024', iana: 'Africa/Luanda' },
  { iso: '204', iana: 'Africa/Porto-Novo' },
  { iso: '072', iana: 'Africa/Gaborone' },
  { iso: '854', iana: 'Africa/Ouagadougou' },
  { iso: '108', iana: 'Africa/Bujumbura' },
  { iso: '132', iana: 'Africa/Douala' },
  { iso: '140', iana: 'Africa/Bangui' },
  { iso: '148', iana: 'Africa/Ndjamena' },
  { iso: '174', iana: 'Indian/Comoro' },
  { iso: '178', iana: 'Africa/Brazzaville' },
  { iso: '180', iana: 'Africa/Kinshasa' },
  { iso: '384', iana: 'Africa/Abidjan' },
  { iso: '262', iana: 'Africa/Djibouti' },
  { iso: '818', iana: 'Africa/Cairo' },
  { iso: '226', iana: 'Africa/Malabo' },
  { iso: '232', iana: 'Africa/Asmara' },
  { iso: '748', iana: 'Africa/Mbabane' },
  { iso: '231', iana: 'Africa/Addis_Ababa' },
  { iso: '266', iana: 'Africa/Libreville' },
  { iso: '270', iana: 'Africa/Banjul' },
  { iso: '288', iana: 'Africa/Accra' },
  { iso: '324', iana: 'Africa/Conakry' },
  { iso: '624', iana: 'Africa/Bissau' },
  { iso: '404', iana: 'Africa/Nairobi' },
  { iso: '426', iana: 'Africa/Maseru' },
  { iso: '430', iana: 'Africa/Monrovia' },
  { iso: '434', iana: 'Africa/Tripoli' },
  { iso: '450', iana: 'Indian/Antananarivo' },
  { iso: '454', iana: 'Africa/Blantyre' },
  { iso: '466', iana: 'Africa/Bamako' },
  { iso: '478', iana: 'Africa/Nouakchott' },
  { iso: '480', iana: 'Indian/Mauritius' },
  { iso: '504', iana: 'Africa/Casablanca' },
  { iso: '508', iana: 'Africa/Maputo' },
  { iso: '516', iana: 'Africa/Windhoek' },
  { iso: '562', iana: 'Africa/Niamey' },
  { iso: '566', iana: 'Africa/Lagos' },
  { iso: '646', iana: 'Africa/Kigali' },
  { iso: '678', iana: 'Africa/Sao_Tome' },
  { iso: '686', iana: 'Africa/Dakar' },
  { iso: '690', iana: 'Indian/Mahe' },
  { iso: '694', iana: 'Africa/Freetown' },
  { iso: '706', iana: 'Africa/Mogadishu' },
  { iso: '710', iana: 'Africa/Johannesburg' },
  { iso: '728', iana: 'Africa/Juba' },
  { iso: '729', iana: 'Africa/Khartoum' },
  { iso: '732', iana: 'Africa/El_Aaiun' },
  { iso: '788', iana: 'Africa/Tunis' },
  { iso: '800', iana: 'Africa/Kampala' },
  { iso: '834', iana: 'Africa/Dar_es_Salaam' },
  { iso: '894', iana: 'Africa/Lusaka' },
  { iso: '716', iana: 'Africa/Harare' },
  { iso: '768', iana: 'Africa/Lome' },
];

/** Map iso -> iana pour les pays africains */
export const ISO_TO_IANA: Record<string, string> = Object.fromEntries(
  AFRICAN_COUNTRIES.map((c) => [c.iso, c.iana]),
);

/** Set des codes ISO africains pour recherche rapide */
export const AFRICAN_ISO_SET: Set<string> = new Set(
  AFRICAN_COUNTRIES.map((c) => c.iso),
);

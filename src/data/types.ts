export type LiveFormat = 'onplace' | 'remote';

export interface CountryInfo {
  iso: string;
  iana: string;
}

export interface PackageInfo {
  id: string;
  name: string;
  description: string;
  priceFCFA: number;
}

export interface BusinessInfo {
  name: string;
  whatsapp: string;
  activity: string;
  product: string;
}

export interface SlotInfo {
  /** index 0-6 */
  index: number;
  /** heure de début à Lomé (UTC), ex. "08:00" */
  startTime: string;
  /** heure de fin à Lomé (UTC), ex. "09:30" */
  endTime: string;
  taken: boolean;
}

export interface ReservationState {
  format: LiveFormat | null;
  countryIso: string | null;
  day: number | null; // 1-31 décembre 2026
  slotIndex: number | null;
  packageId: string | null;
  business: BusinessInfo;
}

export type StepId = 'format' | 'datetime' | 'package' | 'business' | 'confirm';

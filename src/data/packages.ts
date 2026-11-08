import type { PackageInfo } from './types';

export const PACKAGES: PackageInfo[] = [
  {
    id: 'live1',
    name: 'Live 1h30',
    description: 'Un créneau pour présenter ton produit.',
    priceFCFA: 15000,
  },
  {
    id: 'live1-accompagned',
    name: 'Live 1h30 accompagné',
    description: 'Une assistante te guide pendant le live.',
    priceFCFA: 20000,
  },
  {
    id: 'pack4',
    name: 'Pack 4 lives',
    description: 'Quatre créneaux à prix réduit.',
    priceFCFA: 55000,
  },
  {
    id: 'pack8',
    name: 'Pack 8 lives',
    description: 'Huit créneaux pour installer ta présence.',
    priceFCFA: 100000,
  },
  {
    id: 'bovann-announce',
    name: 'Bovann annonce ton live',
    description: 'Il poste ta vidéo et annonce ton live sur son compte.',
    priceFCFA: 75000,
  },
  {
    id: 'pack-month',
    name: 'Pack du mois',
    description: 'Des lives pendant tout le mois.',
    priceFCFA: 200000,
  },
];

export const PACKAGES_TARIFF_NOTE =
  'Tarifs de démonstration, à confirmer avant le lancement.';

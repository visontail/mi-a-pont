import type { Targy } from '../lib/calc';

export const jegySorok = [
  ['magyarNyelvtan', 'Magyar nyelvtan'],
  ['magyarIrodalom', 'Magyar irodalom'],
  ['tortenelem', 'Történelem'],
  ['matematika', 'Matematika'],
  ['idegen', 'Idegen nyelv'],
  ['otodik', '5. tantárgy'],
];
export const vizsgaSorok = [
  ['magyar', 'Magyar nyelv és irodalom'],
  ['tortenelem', 'Történelem'],
  ['matematika', 'Matematika'],
  ['idegen', 'Idegen nyelv'],
];
export const otodikTargyak = [
  ['biologia', 'Biológia'],
  ['tarsadalomismeret', 'Társadalomismeret'],
  ['kemia', 'Kémia'],
  ['fizika', 'Fizika'],
  ['foldrajz', 'Földrajz'],
  ['digitalis', 'Digitális kultúra'],
  ['egyeb', 'Egyéb'],
];
export const nyelvOpciok = [
  ['', 'Nincs'],
  ['B2', 'B2 komplex (középfok)'],
  ['C1', 'C1 komplex (felsőfok)'],
  ['B2r', 'B2 csak írásbeli vagy szóbeli'],
  ['C1r', 'C1 csak írásbeli vagy szóbeli'],
];

// The first four érettségi subjects, in form order; the 5th is picked from otodikTargyak.
export const TARGYAK = vizsgaSorok.map(([k]) => k) as Targy[];

// Short names for the result breakdown.
export const NEV: Record<string, string> = {
  magyar: 'Magyar', tortenelem: 'Történelem', matematika: 'Matematika', idegen: 'Idegen nyelv',
  biologia: 'Biológia', tarsadalomismeret: 'Társadalomismeret', kemia: 'Kémia', fizika: 'Fizika',
  foldrajz: 'Földrajz', digitalis: 'Digitális kultúra', egyeb: 'Egyéb',
};

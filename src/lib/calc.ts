// Felvételi pontszámítás (2026–2028 rules). Pure functions, no DOM.

export type Szint = 'kozep' | 'emelt';
export type Targy =
  | 'magyar' | 'tortenelem' | 'matematika' | 'idegen'
  | 'biologia' | 'tarsadalomismeret' | 'fizika' | 'kemia' | 'foldrajz' | 'digitalis' | 'egyeb';
export type Nyelvvizsga = '' | 'B2r' | 'B2' | 'C1r' | 'C1';

export interface Vizsga { targy: Targy; szazalek: number; szint: Szint }
type Ket = [number, number]; // [utolsó előtti év, utolsó év]

export interface Input {
  jegyek: {
    magyarNyelvtan: Ket; magyarIrodalom: Ket;
    tortenelem: Ket; matematika: Ket; idegen: Ket; otodik: Ket;
  };
  vizsgak: Vizsga[]; // the 5 érettségi exams; index 3 is the foreign language
  nyelvvizsga: [Nyelvvizsga, Nyelvvizsga]; // [same language as the érettségi, another language]
  esely: number; // how many esélyegyenlőség categories apply (0–3)
  extrak: string[]; // ids of the program's ticked extras
  egyeb: number; // sport, competitions, anything else, typed in
  katonai: number; // 0 | 16 | 32 | 64, set by law, outside intézményi pontok
}

export interface Program {
  id: string; nev: string; egyetem: string; varos: string; // nev: short label for the dropdown
  ponthatar: { pont: number; ev: number };
  adatEv: number; forras: string; megjegyzes?: string;
  emeltKell: boolean;
  targyak: Targy[]; // subjects accepted for érettségi pontok
  emelt: { min: number; elfogadott: number; egyeb: number; max?: number; csakBeszamitott?: boolean };
  kozep?: { min: number; pont: number; max: number; csakElfogadott: boolean };
  nyelv: Record<Exclude<Nyelvvizsga, ''>, number>; nyelvMax?: number;
  esely: number; eselyMax?: number;
  extrak: { id: string; cimke: string; pont: number }[];
  egyebTipp: string;
}

const NYELV_IDX = 3;
const cap = (n: number, max?: number) => (max === undefined ? n : Math.min(n, max));

export const kozepPont = (szazalek: number) => Math.round((szazalek * 2) / 3);
export const vizsgaPont = (v: Vizsga) => (v.szint === 'emelt' ? v.szazalek : kozepPont(v.szazalek));

export function tanulmanyi(i: Input) {
  const j = i.jegyek;
  let osszeg = 0;
  for (const y of [0, 1]) {
    // magyar = unrounded average of nyelvtan and irodalom
    osszeg += (j.magyarNyelvtan[y] + j.magyarIrodalom[y]) / 2
      + j.tortenelem[y] + j.matematika[y] + j.idegen[y] + j.otodik[y];
  }
  const jegyPont = osszeg * 2;
  const atlag = Math.round(i.vizsgak.reduce((s, v) => s + v.szazalek, 0) / i.vizsgak.length);
  return { jegyPont, atlag, osszes: jegyPont + atlag };
}

/** Best two accepted exams; if the program requires emelt, the pair must contain one. */
export function erettsegi(p: Program, vizsgak: Vizsga[]) {
  const jo = vizsgak
    .map((v, idx) => ({ v, idx, pont: vizsgaPont(v) }))
    .filter((x) => p.targyak.includes(x.v.targy));
  let best: { pont: number; idx: number[] } | null = null;
  let bestAny: { pont: number; idx: number[] } | null = null;
  for (let a = 0; a < jo.length; a++) {
    for (let b = a + 1; b < jo.length; b++) {
      const par = { pont: jo[a].pont + jo[b].pont, idx: [jo[a].idx, jo[b].idx] };
      if (!bestAny || par.pont > bestAny.pont) bestAny = par;
      const vanEmelt = jo[a].v.szint === 'emelt' || jo[b].v.szint === 'emelt';
      if ((!p.emeltKell || vanEmelt) && (!best || par.pont > best.pont)) best = par;
    }
  }
  const valasztott = best ?? bestAny ?? { pont: 0, idx: [] };
  return { pont: valasztott.pont, beszamitott: valasztott.idx, hianyzoEmelt: p.emeltKell && !best };
}

export function intezmenyi(p: Program, i: Input, beszamitott: number[]) {
  const emeltPont = (v: Vizsga, idx: number) => {
    if (v.szint !== 'emelt' || v.szazalek < p.emelt.min) return 0;
    if (p.emelt.csakBeszamitott) return beszamitott.includes(idx) ? p.emelt.elfogadott : 0;
    return p.targyak.includes(v.targy) ? p.emelt.elfogadott : p.emelt.egyeb;
  };
  // one claim per language: the érettségi language gets the better of its emelt bonus or the exam
  const elsoVizsga = i.nyelvvizsga[0] ? p.nyelv[i.nyelvvizsga[0]] : 0;
  const vizsgaNyer = elsoVizsga > emeltPont(i.vizsgak[NYELV_IDX], NYELV_IDX);

  const emelt = cap(
    i.vizsgak.reduce((s, v, idx) => s + (idx === NYELV_IDX && vizsgaNyer ? 0 : emeltPont(v, idx)), 0),
    p.emelt.max,
  );
  const k = p.kozep;
  const kozep = k
    ? cap(i.vizsgak.filter((v) => v.szint === 'kozep' && v.szazalek >= k.min
        && (!k.csakElfogadott || p.targyak.includes(v.targy))).length * k.pont, k.max)
    : 0;
  const masodik = i.nyelvvizsga[1] ? p.nyelv[i.nyelvvizsga[1]] : 0;
  const nyelv = cap((vizsgaNyer ? elsoVizsga : 0) + masodik, p.nyelvMax);
  const esely = cap(i.esely * p.esely, p.eselyMax);
  const extrak = p.extrak.filter((e) => i.extrak.includes(e.id)).reduce((s, e) => s + e.pont, 0);
  const egyeb = Math.max(0, i.egyeb);
  return { emelt, kozep, nyelv, esely, extrak, egyeb, osszes: Math.min(100, emelt + kozep + nyelv + esely + extrak + egyeb) };
}

export function osszesit(p: Program, i: Input) {
  const tan = tanulmanyi(i);
  const er = erettsegi(p, i.vizsgak);
  const inst = intezmenyi(p, i, er.beszamitott);
  const I = tan.osszes + er.pont;
  const II = 2 * er.pont;
  const modszer: 'I' | 'II' = II > I ? 'II' : 'I';
  const osszes = Math.min(500, Math.max(I, II) + inst.osszes + i.katonai);
  return { tan, er, inst, I, II, modszer, osszes };
}

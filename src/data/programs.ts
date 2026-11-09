import type { Program, Targy } from '../lib/calc';

// shortcut: hand-copied from each university's published rules (Nov 2026), update yearly or scrape felvi.hu if this goes public.

const ALAP: Targy[] = ['magyar', 'tortenelem', 'matematika', 'idegen', 'biologia'];
const NINCS_RESZLEGES = { B2r: 0, C1r: 0 };

export const programs: Program[] = [
  {
    id: 'elte', nev: 'ELTE PPK', egyetem: 'Eötvös Loránd Tudományegyetem, Pedagógiai és Pszichológiai Kar', varos: 'Budapest',
    ponthatar: { pont: 455, ev: 2026 }, adatEv: 2026,
    forras: 'https://eduline.hu/erettsegi-felveteli/20260131_felveteli-2026-mutatjuk-milyen-intezmenyi-pontokat-kaphattok-az-elte-n',
    megjegyzes: 'A nyelvvizsga-pontok 2025-ös értékek.',
    emeltKell: true,
    targyak: [...ALAP, 'tarsadalomismeret'],
    emelt: { min: 45, elfogadott: 50, egyeb: 0, max: 100 },
    nyelv: { ...NINCS_RESZLEGES, B2: 28, C1: 50 }, nyelvMax: 50,
    esely: 30,
    extrak: [],
    egyebTipp: 'Sport: diákolimpia országos 1–3. hely 10, országos bajnokság 1–3. hely 15, korosztályos VB/EB 20. Verseny: OKTV 1–10. hely 20, TUDOK 20/30, Ifjú tudósok 25/50/100.',
  },
  {
    id: 'ppke', nev: 'PPKE BTK', egyetem: 'Pázmány Péter Katolikus Egyetem, Bölcsészet- és Társadalomtudományi Kar', varos: 'Budapest',
    ponthatar: { pont: 474, ev: 2025 }, adatEv: 2026,
    forras: 'https://eduline.hu/felsooktatas/20260207_felveteli-2026-ilyen-intezmenyi-pontokat-kaphattok-a-pazmanyon',
    emeltKell: true,
    targyak: ALAP,
    emelt: { min: 45, elfogadott: 50, egyeb: 0, csakBeszamitott: true },
    nyelv: { ...NINCS_RESZLEGES, B2: 30, C1: 50 },
    esely: 30,
    extrak: [
      { id: 'plebania', cimke: 'Aktív plébániai közösségi élet', pont: 10 },
      { id: 'hittan', cimke: 'Legalább 1 év katolikus hittan a középiskolában', pont: 15 },
    ],
    egyebTipp: 'Közösségi szolgálat, önkéntesség, munka: egyénileg 1–30. Sport 10–50. OKTV 1–10. hely 50, 11–20. hely 25. Pázmány BölcsÉsz verseny 1–5. hely 50, 6–10. hely 25.',
  },
  {
    id: 'kre', nev: 'KRE BTK', egyetem: 'Károli Gáspár Református Egyetem, Bölcsészet- és Társadalomtudományi Kar', varos: 'Budapest',
    ponthatar: { pont: 447, ev: 2025 }, adatEv: 2025,
    forras: 'https://eduline.hu/erettsegi_felveteli/20250605_Karoli_intezmenyi_pontok_szamitasa_2025_felveteli',
    megjegyzes: '2026-os táblázat nem volt elérhető, ezek 2025-ös értékek.',
    emeltKell: true,
    targyak: ALAP,
    emelt: { min: 45, elfogadott: 50, egyeb: 0, max: 100, csakBeszamitott: true },
    nyelv: { ...NINCS_RESZLEGES, B2: 28, C1: 40 },
    esely: 40,
    extrak: [
      { id: 'reformatus', cimke: 'Református középiskolában érettségizett', pont: 25 },
      { id: 'hittanErettsegi', cimke: 'Hittanból érettségizett', pont: 25 },
    ],
    egyebTipp: 'Egyházi önkéntes munka (min. 6 hónap): 10–20. Károli Junior Akadémia alapkurzus: 100, más KJA program: 25. Sport 10–50. OKTV 1–10. hely 100.',
  },
  {
    id: 'pte', nev: 'PTE BTK', egyetem: 'Pécsi Tudományegyetem, Bölcsészet- és Társadalomtudományi Kar', varos: 'Pécs',
    ponthatar: { pont: 431, ev: 2026 }, adatEv: 2027,
    forras: 'https://pte.hu/hu/felveteli/kepzes/pszichologia-magyar-vagy-angol-nyelven-alapszak',
    emeltKell: true,
    targyak: ALAP,
    emelt: { min: 45, elfogadott: 50, egyeb: 50 },
    kozep: { min: 85, pont: 33, max: 66, csakElfogadott: false },
    nyelv: { ...NINCS_RESZLEGES, B2: 30, C1: 50 },
    esely: 40,
    extrak: [
      { id: 'regionalis', cimke: 'Baranya, Somogy, Tolna vagy Bács-Kiskun megyei érettségi, min. 4,2 átlag', pont: 10 },
      { id: 'onkentes', cimke: 'Legalább 25 óra igazolt szociális önkéntesség', pont: 15 },
      { id: 'tehetseg', cimke: 'Tehetséggondozó program (pl. Pszieszta, MCC)', pont: 10 },
      { id: 'icdl', cimke: 'ICDL tanúsítvány', pont: 10 },
      { id: 'rendezveny', cimke: 'Részvétel PTE BTK pályaorientációs rendezvényen', pont: 15 },
    ],
    egyebTipp: 'Verseny 10–100. Sport 10–50. PEAC aktív sport max 10. Kreatábor 10. Második BTK rendezvény +15 (max 30).',
  },
  {
    id: 'pannon', nev: 'Pannon HTK', egyetem: 'Pannon Egyetem, Humántudományi Kar', varos: 'Veszprém',
    ponthatar: { pont: 421, ev: 2025 }, adatEv: 2026,
    forras: 'https://felveteli.uni-pannon.hu/intezmenyi-pontok/',
    megjegyzes: 'Az esélyegyenlőségi pontérték becsült (a felső határ 50).',
    emeltKell: false,
    targyak: ALAP,
    emelt: { min: 47, elfogadott: 40, egyeb: 25, max: 80 },
    kozep: { min: 75, pont: 20, max: 40, csakElfogadott: true },
    nyelv: { B2r: 10, B2: 25, C1r: 20, C1: 40 }, nyelvMax: 65,
    esely: 25, eselyMax: 50,
    extrak: [],
    egyebTipp: '„Láss, ne csak nézz!” pszichológiai pályázat: részvétel 10, 6–10. hely 20, 1–5. hely 30. Versenyek max 60, sport max 50, MCC programok max 20.',
  },
];

import { osszesit, type Input, type Nyelvvizsga, type Szint, type Targy } from '../lib/calc';
import { programs } from '../data/programs';
import { NEV, TARGYAK } from '../data/constants';

const form = document.getElementById('form') as HTMLFormElement;
const $ = (id: string) => document.getElementById(id)!;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : 0));

function olvas(fd: FormData): Input {
  const num = (k: string, hi: number) => clamp(Number(fd.get(k) || 0), 0, hi);
  const ket = (id: string): [number, number] => [num(`j_${id}_0`, 5), num(`j_${id}_1`, 5)];
  return {
    jegyek: {
      magyarNyelvtan: ket('magyarNyelvtan'), magyarIrodalom: ket('magyarIrodalom'),
      tortenelem: ket('tortenelem'), matematika: ket('matematika'), idegen: ket('idegen'), otodik: ket('otodik'),
    },
    vizsgak: [0, 1, 2, 3, 4].map((i) => ({
      targy: (i < 4 ? TARGYAK[i] : fd.get('v_targy_4')) as Targy,
      szazalek: Math.round(num(`v_pct_${i}`, 100)),
      szint: fd.get(`v_szint_${i}`) as Szint,
    })),
    nyelvvizsga: [fd.get('nyelv_0') as Nyelvvizsga, fd.get('nyelv_1') as Nyelvvizsga],
    esely: fd.getAll('esely').length,
    extrak: fd.getAll('extra') as string[],
    egyeb: num('egyeb', 100),
    katonai: num('katonai', 64),
  };
}

function frissit() {
  const fd = new FormData(form);
  const p = programs.find((x) => x.id === fd.get('program'))!;
  document.querySelectorAll<HTMLElement>('[data-program]').forEach((el) => (el.hidden = el.dataset.program !== p.id));

  const input = olvas(fd);
  // ignore ticked extras of other programs
  input.extrak = input.extrak.filter((id) => p.extrak.some((e) => e.id === id));
  const r = osszesit(p, input);
  const elso = r.modszer === 'I' ? r.tan.osszes : r.er.pont;

  $('osszes').textContent = String(r.osszes);
  $('l1').textContent = r.modszer === 'I' ? 'Tanulmányi pont' : 'Érettségi pont (duplázás)';
  $('r1').textContent = String(elso);
  $('r2').textContent = String(r.er.pont);
  $('r3').textContent = String(r.inst.osszes);
  $('r4').textContent = String(input.katonai);
  $('rowKat').hidden = !input.katonai;
  [elso, r.er.pont, r.inst.osszes].forEach((v, i) => ($(`bar${i + 1}`).style.width = `${(v / 500) * 100}%`));

  $('modszer').textContent = r.modszer === 'I'
    ? 'Számítás: tanulmányi + érettségi pont (ez a kedvezőbb).'
    : 'Számítás: érettségi pont duplázva (ez a kedvezőbb).';

  const diff = r.osszes - p.ponthatar.pont;
  const hasonlit = $('hasonlit');
  hasonlit.textContent = `${p.ponthatar.ev}-es ponthatár: ${p.ponthatar.pont}. ${diff >= 0 ? `+${diff} pont felette` : `${-diff} pont hiányzik`}`;
  hasonlit.className = `compare ${diff >= 0 ? 'good' : ''}`;

  const figy: string[] = [];
  if (r.er.hianyzoEmelt) figy.push('Ehhez a szakhoz a beszámított tárgyak közül legalább egy emelt szintű érettségi kell.');
  if (p.adatEv < 2026) figy.push(`A ${p.nev} pontjai ${p.adatEv}-ös adatok.`);
  $('figyelm').replaceChildren(...figy.map((t) => Object.assign(document.createElement('li'), { textContent: t })));

  const besz = r.er.beszamitott.map((i) => `${NEV[input.vizsgak[i].targy]} (${input.vizsgak[i].szint === 'emelt' ? 'emelt' : 'közép'})`).join(', ') || '–';
  const sorok: [string, string | number][] = [
    ['Jegyekből', r.tan.jegyPont], ['Érettségi átlag', r.tan.atlag],
    ['I. módszer', r.I], ['II. módszer', r.II],
    ['Beszámított tárgyak', besz],
    ['Emelt érettségi', r.inst.emelt], ['Középszintű érettségi', r.inst.kozep], ['Nyelvvizsga', r.inst.nyelv],
    ['Esélyegyenlőség', r.inst.esely], ['Szak-specifikus', r.inst.extrak], ['Egyéb', r.inst.egyeb],
  ];
  $('reszletek').replaceChildren(...sorok.map(([k, v]) => {
    const d = document.createElement('div');
    d.append(Object.assign(document.createElement('dt'), { textContent: k }), Object.assign(document.createElement('dd'), { textContent: String(v) }));
    return d;
  }));
}

form.addEventListener('input', frissit);
form.addEventListener('change', frissit);
frissit();

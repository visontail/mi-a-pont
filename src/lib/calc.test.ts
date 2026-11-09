import { describe, expect, it } from 'vitest';
import { kozepPont, osszesit, tanulmanyi, erettsegi, intezmenyi, type Input, type Vizsga } from './calc';
import { programs } from '../data/programs';

const P = Object.fromEntries(programs.map((p) => [p.id, p]));
const v = (targy: Vizsga['targy'], szazalek: number, szint: Vizsga['szint'] = 'kozep'): Vizsga => ({ targy, szazalek, szint });

function input(over: Partial<Input> = {}): Input {
  const k = (n: number): [number, number] => [n, n];
  return {
    jegyek: { magyarNyelvtan: k(5), magyarIrodalom: k(5), tortenelem: k(5), matematika: k(5), idegen: k(5), otodik: k(5) },
    vizsgak: [v('magyar', 100, 'emelt'), v('tortenelem', 100), v('matematika', 100), v('idegen', 100), v('biologia', 100, 'emelt')],
    nyelvvizsga: ['', ''], esely: 0, extrak: [], egyeb: 0, katonai: 0,
    ...over,
  };
}

describe('közép → pont (official 2/3 table)', () => {
  it.each([[100, 67], [90, 60], [75, 50], [50, 33], [27, 18], [26, 17], [25, 17]])('%i%% → %i', (pct, pont) => {
    expect(kozepPont(pct)).toBe(pont);
  });
});

describe('tanulmányi', () => {
  it('averages magyar nyelvtan + irodalom unrounded', () => {
    const i = input();
    i.jegyek.magyarNyelvtan = [4, 4]; // magyar = 4.5 each year
    expect(tanulmanyi(i).jegyPont).toBe((4.5 + 20) * 2 * 2);
  });
  it('rounds the érettségi average', () => {
    const i = input({ vizsgak: [v('magyar', 71), v('tortenelem', 72), v('matematika', 72), v('idegen', 72), v('biologia', 72)] });
    expect(tanulmanyi(i).atlag).toBe(72); // 71.8
  });
});

describe('összesítés', () => {
  it('perfect student hits exactly 500', () => {
    expect(osszesit(P.elte, input({ esely: 3 })).osszes).toBe(500);
  });
  it('doubling wins when grades are weak', () => {
    const k = (n: number): [number, number] => [n, n];
    const i = input({ jegyek: { magyarNyelvtan: k(2), magyarIrodalom: k(2), tortenelem: k(2), matematika: k(2), idegen: k(2), otodik: k(2) } });
    const r = osszesit(P.elte, i);
    expect(r.modszer).toBe('II');
    expect(r.II).toBe(400);
  });
  it('military points are added outside the 100 cap, total still ≤ 500', () => {
    const k = (n: number): [number, number] => [n, n];
    const i = input({ jegyek: { magyarNyelvtan: k(3), magyarIrodalom: k(3), tortenelem: k(3), matematika: k(3), idegen: k(3), otodik: k(3) },
      vizsgak: [v('magyar', 60), v('tortenelem', 60), v('matematika', 60), v('idegen', 60), v('biologia', 60)], katonai: 32 });
    const r = osszesit(P.pannon, i);
    expect(r.osszes).toBe(Math.max(r.I, r.II) + r.inst.osszes + 32);
  });
});

describe('érettségi pont', () => {
  it('requires an emelt exam in the counted pair when the program asks for it', () => {
    const vs = [v('magyar', 95), v('tortenelem', 95), v('matematika', 50), v('idegen', 50), v('biologia', 60, 'emelt')];
    // best közép pair = 63+63 = 126, but must include emelt bio (60) + közép 63 = 123
    expect(erettsegi(P.elte, vs)).toMatchObject({ pont: 123, hianyzoEmelt: false });
    expect(erettsegi(P.pannon, vs).pont).toBe(126);
  });
  it('flags when no emelt exam exists', () => {
    const vs = [v('magyar', 80), v('tortenelem', 80), v('matematika', 80), v('idegen', 80), v('biologia', 80)];
    expect(erettsegi(P.ppke, vs).hianyzoEmelt).toBe(true);
  });
  it('ignores subjects the program does not accept', () => {
    const vs = [v('magyar', 10), v('tortenelem', 10), v('matematika', 10), v('idegen', 10), v('tarsadalomismeret', 100, 'emelt')];
    expect(erettsegi(P.pte, vs).pont).toBe(14); // tarsadalomismeret not accepted at PTE
    expect(erettsegi(P.elte, vs).pont).toBe(107);
  });
});

describe('intézményi pontok', () => {
  it('caps total at 100', () => {
    const i = input({ nyelvvizsga: ['C1', 'C1'], esely: 3, egyeb: 50 });
    const r = osszesit(P.pte, i);
    expect(r.inst.osszes).toBe(100);
  });
  it('Pannon: emelt 40 accepted / 25 other, ≥47%, cap 80', () => {
    const i = input({ vizsgak: [v('magyar', 46, 'emelt'), v('tortenelem', 50, 'emelt'), v('matematika', 50, 'emelt'), v('idegen', 30), v('fizika', 90, 'emelt')] });
    expect(intezmenyi(P.pannon, i, []).emelt).toBe(80); // 40+40+25 = 105 → 80, magyar 46% too low
  });
  it('PPKE only rewards emelt exams that are counted in érettségi pontok', () => {
    const i = input({ vizsgak: [v('magyar', 90, 'emelt'), v('tortenelem', 90, 'emelt'), v('matematika', 50, 'emelt'), v('idegen', 40), v('biologia', 40)] });
    const r = osszesit(P.ppke, i);
    expect(r.er.pont).toBe(180);
    expect(r.inst.emelt).toBe(100);
    expect(intezmenyi(P.elte, i, r.er.beszamitott).emelt).toBe(100); // ELTE cap 100 (3 × 50)
  });
  it('same language: only the better of exam or emelt érettségi counts', () => {
    const i = input({ vizsgak: [v('magyar', 50), v('tortenelem', 50), v('matematika', 50), v('idegen', 80, 'emelt'), v('biologia', 50)], nyelvvizsga: ['B2', ''] });
    const r = intezmenyi(P.pte, i, []);
    expect(r.emelt + r.nyelv).toBe(50); // emelt nyelv 50 beats B2 30, not 80
  });
  it('PTE gives 33 per közép exam ≥85%, max 66', () => {
    const i = input({ vizsgak: [v('magyar', 90), v('tortenelem', 90), v('matematika', 90), v('idegen', 50), v('biologia', 20)] });
    expect(intezmenyi(P.pte, i, []).kozep).toBe(66);
  });
  it('Pannon language cap 65', () => {
    const i = input({ nyelvvizsga: ['C1', 'C1'] });
    expect(intezmenyi(P.pannon, { ...i, vizsgak: i.vizsgak.map((x) => ({ ...x, szint: 'kozep' as const })) }, []).nyelv).toBe(65);
  });
});

# Mi A Pont: psychology BA admission point calculator

Project folder and package name: `mi-a-pont`. The site title, `<title>` and header all read **"Mi A Pont"**.

## Context
Your sister finishes gimnázium and applies in the 2027 round, to psychology BA programs in Budapest, at Pannon (Veszprém) and at PTE (Pécs). She needs to know her score out of 500. Each program sets its own intézményi pontok (max 100), so the app hardcodes each program's rules. She picks a program from a dropdown, fills in one form, and gets her score.

- No auth, no database, no storage, no server.
- UI is in Hungarian.
- Gimnázium path only.
- If it ever goes public, the program data file is the one part to replace with a scraped or updated source.

## Framework: Astro (answering "is Astro a bad choice?")
No, it is the best fit here. It builds to a single static HTML page with almost no JS and can be hosted for free anywhere. The logic is a pure TypeScript module, and a small `<script>` re-runs it on every input change. React would ship its runtime for one form, and Next.js's server/client machinery is unnecessary for this.

## Research: shared rules (valid for 2026 and 2027–28)
- **Total** = max of:
  - I. tanulmányi + érettségi + intézményi
  - II. 2 × érettségi + intézményi
  - The total is capped at 500.
- **Tanulmányi (max 200)** = A + B.
  - A = (sum of the year-end grades from the last 2 years in 5 subjects) × 2.
    - The 5 subjects are magyar, történelem, matek, idegen nyelv, and a 5th chosen subject.
    - For magyar, each year's grade is the unrounded average of nyelvtan and irodalom.
  - B = average of the 5 érettségi percentages, rounded. The exam level doesn't matter here.
- **Érettségi (max 200)** = two érettségi subjects that the program accepts.
  - Emelt: points = %.
  - Közép: points = round(% × 2/3), so 100% gives 67 points. This matches the published table: 25→17, 27→18, 50→33, 75→50, 90→60.
  - The app picks the best two of the exams she enters.
- **No national minimum score** since 2023/24. Each program sets its own minimum.
- **Military service** gives 16/32/64 points. This is set by law, and PPKE says it is *not* part of intézményi pontok, so the app adds it separately and the total stays capped at 500.

## Research: the 5 programs (hardcoded in `src/data/programs.ts`)
In the table, "érettségi pont" means the two subjects that make up her érettségi pontok.

| Program | Required emelt | Emelt bonus | Language | Esélyegyenlőség | Extras | Data year |
|---|---|---|---|---|---|---|
| **ELTE PPK**, Budapest (2026 ponthatár 455) | yes, at least 1 | 50 per érettségi pont subject at ≥45%, max 100 | B2 28, C1 50 (max 50) | 30 each | sport / competitions | 2026; language values from 2025 |
| **PPKE BTK**, Budapest (2025 ponthatár 474) | yes | 50 per subject at ≥45%, only if that exam is used in the érettségi pontok | B2 30, C1 50 | 30 each | parish life 10, Catholic religion studies 15, volunteering/work 1–30, sport / competitions | 2026 |
| **KRE BTK**, Budapest (2025 ponthatár 447) | yes (per eduline) | 50 per subject at ≥45%, max 100 | B2 28, C1 40 | 40 each | Reformed secondary school 25, hittan érettségi 25, church volunteering 10–20, Károli Junior Akadémia 25/100 | **2025 only** (no 2026 found) |
| **PTE BTK**, Pécs (2026 ponthatár 431) | yes, at least 1 | 50 per emelt subject (any subject) at ≥45% | B2 30, C1 50 (one item per language) | 40 each | 33 per közép exam at ≥85% (max 66); sport 10–50; competitions 10–100; social volunteering ≥25 h 15; BTK events 15 (max 30); talent programs (e.g. Pszieszta) 10; ICDL 10; regional érettségi with ≥4.2 average 10 | **2027** ✅ |
| **Pannon HTK**, Veszprém (2025 ponthatár 421) | **no** | 40 per érettségi pont subject, 25 per other subject; ≥47%; max 80 | B2 10/25/30, C1 20/40 (max 65) | max 50 (value unknown) | 20 per közép exam at ≥75% in an érettségi pont subject (max 40); "Láss, ne csak nézz!" competition 10/20/30 | 2026 |

For every program:
- Sport and competition results go into one free number field. Each program's hint shows its point scale, because that list is long.
- When a language exam and an emelt language érettségi overlap, only the higher one counts.
- The 100 cap is applied last.

Accepted érettségi pont subjects:
- **ELTE:** biológia, magyar, matek, történelem, társadalomismeret, idegen nyelv.
- **Pannon:** biológia, magyar, matek, történelem, idegen nyelv.
- **PTE (2027, verified):** történelem, matek, magyar, biológia, idegen nyelv. Any subject can be the 5th tanulmányi subject.
- **PPKE / KRE:** assumed to be the same as Pannon. ⚠ Not verified, because felvi.hu blocks automated fetching.

## Files
```
mi-a-pont/
  src/lib/calc.ts         pure functions: kozepPont, tanulmanyi, erettsegi, intezmenyi(program, input), total
  src/lib/calc.test.ts    Vitest: közép table values, magyar averaging, max case = 500, doubling wins, each program's caps
  src/data/programs.ts    the 5 programs above as data, each with a `source` URL and a `year` field
  src/pages/index.astro   program dropdown + form + sticky result card + inline <script>
  src/styles/global.css   apple-design tokens, light/dark
```

## UI (apple-design skill, ponytail minimalism)
- **Single column:**
  1. Program dropdown
  2. Grades (5 subjects × 2 years)
  3. 5 érettségi percentages, each with a közép/emelt toggle
  4. That program's intézményi checklist
- **Sticky result card:**
  - Total out of 500, with a bar split into its three parts.
  - Which method won (I or II).
  - That program's last ponthatár, for comparison.
- **Warnings**, for example:
  - "Ehhez a szakhoz emelt érettségi kell" (this program needs an emelt érettségi).
  - "2025-ös adat" (2025 data) on KRE.
- Footer: "Tájékoztató jellegű, ellenőrizd a felvi.hu-n" ("For information only; check it on felvi.hu").

## Verification
1. `npm test`: all unit tests pass.
2. `npm run dev`: enter a sample profile and check it by hand against the Óbudai Egyetem's 2026 calculator for the base 400 points.
3. `npm run build`: the output is static files only.

## Open items for you to validate
- KRE values are from 2025, and the 2026 table wasn't found. Pannon's esélyegyenlőség value is unknown.
- PPKE and KRE accepted subjects are unverified.
- If you open the felvi.hu pages for these programs (Meghirdetett képzések → Intézményi pontok tab) in a browser, I can fill in any gaps.

Sources: eduline.hu (2026 pontszámítás, 2027–28, psychology ponthatárok 2026-07-07, ELTE intézményi pontok 2026-01-31, Pázmány intézményi pontok 2026-02-07, Károli 2025), gtk.elte.hu/pontszamitas2026, ktk.pte.hu/pontszamitas-reszletei-2026, btk.ppke.hu/pontszamitas, felveteli.uni-pannon.hu/intezmenyi-pontok, pte.hu/hu/felveteli/kepzes/pszichologia-magyar-vagy-angol-nyelven-alapszak (2027), pmi.htk.uni-pannon.hu, szavon.hu (2026-06-29), telex.hu (2026-07-23).

## Implementation status (2026-11-09)
- **Live:** https://mi-a-pont.the051425.workers.dev/ (Cloudflare Workers, static assets). Repo: https://github.com/visontail/mi-a-pont. Every push to `main` redeploys. `wrangler.jsonc` uploads `dist/` as plain assets; without it, `wrangler deploy` tries to convert the site to server-rendered Astro and fails. Node is pinned via `.node-version` (22) and `engines` (Astro needs ≥ 22.23.4).
- **Files:**
  - `src/layouts/Layout.astro`: shared head, header, footer ("Made by ❤️ Leo"), CSS imports
  - `src/pages/index.astro`: calculator markup
  - `src/pages/hogyan.astro`: "Hogyan számolunk?" explanation page, linked under the result card
  - `src/scripts/app.ts`: form reading and result rendering
  - `src/styles/global.css`: colour tokens and base styles
  - `src/styles/page.css`: page styles
  - `src/data/constants.ts`: form lists, `TARGYAK`, `NEV`
  - `src/data/programs.ts`: the 5 programs (`nev` = short dropdown label, `egyetem` = full name shown as "Választott egyetem")
  - `src/lib/calc.ts` with `calc.test.ts`: 21 tests passing
- **Layout:** desktop has the form on the left and a sticky right column with the Szak card above the result card. On phones the Szak card comes first and the result is a compact sticky bottom bar with a Részletek toggle. Dropdowns use a custom CSS chevron inset 16px. The page CSS is global, not Astro-scoped, because the JS builds the Részletek rows.
- **Checked:** headless Chrome at 1280px and 375px, light and dark mode; live URLs return 200.
- **Next:** check on a real iPhone (Safari safe area, select pickers). Verify the full university/faculty names in `programs.ts`, which were written from memory (especially Pannon "Humántudományi Kar").
- **Still open:** KRE 2026 values, Pannon esélyegyenlőség value, PPKE/KRE accepted subjects (need felvi.hu text from the user).

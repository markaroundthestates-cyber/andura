# Andura mobile — Wave 0 (RN + Expo port, branch `rn-port`)

De-risk pas: dovedeste ca engine-ul Andura (`../src/engine/**`, JS pur,
framework-agnostic) se importa + ruleaza neschimbat intr-o aplicatie React
Native + Expo. SCAFFOLD only — boot-ul nativ se face pe masina ta (sandbox-ul de
build nu are simulator iOS/Android).

## Ce ruleaza Daniel pe masina lui

```bash
cd mobile
npm install
npx expo start
```

Apoi in terminalul Expo:

- `i` — pornește iOS Simulator (necesita Xcode pe macOS)
- `a` — pornește Android emulator (necesita Android Studio)
- `w` — ruleaza in browser (cel mai rapid smoke, fara simulator)

## Ce ar trebui sa VEZI pe ecran

Un singur ecran (scroll), pe fundal inchis, cu:

1. **frequencyToSplit(4, 'v-taper')** → un array de tip
   push / pull / upper / lower (split-ul reshape-uit de preset-ul v-taper
   pentru o saptamana de 4 zile).
2. **getDailyWorkout(state, 2026-05-18)** → `sessionType` real al sesiunii
   (ex. PUSH / PULL / UPPER / LOWER / FULL).
3. **Primele ~5 exercitii** ale sesiunii, fiecare cu nume + numar de seturi.

Daca toate trei apar cu date reale (nu `...` si fara `EROARE:`), atunci
engine-ul (crown jewel) porteaza intact in RN → teza centrala a portului
(DECISIONS §D103) e confirmata.

## Cum se rezolva importul cross-dir

`App.tsx` importa direct `../src/engine/schedule/scheduleAdapter.js`. Engine-ul
NU e mutat — `metro.config.js` adauga repo-root la `watchFolders` ca Metro sa
poata bundle-ui fisiere de deasupra lui `mobile/`. Nimic din `src/**` nu e
atins; web app-ul + testele lui raman byte-identical.

### Daca importul cross-dir da batai de cap

Daca Metro refuza importul de deasupra root-ului (sau apar conflicte de
dependency resolution), fallback Wave 1: copiem / mutam engine-ul intr-un
pachet partajat `packages/core` (npm workspaces la root) si il consuma si web
app-ul, si `mobile/`, ca dependinta normala in loc de import relativ cross-dir.

## Note

- `npm install` pentru RN/Expo NU a fost rulat in sandbox-ul de scaffold (poate
  cere retea) — se ruleaza pe masina ta (vezi mai sus).
- Wave 0 = proof, nu polish: fara librarie de styling, fara navigatie, fara
  store. Un singur ecran care apeleaza engine-ul.

// Env-gated logger — hygiene pre-Beta. Tine consola de productie curata fara sa
// pierdem diagnostice in dev.
//
// De ce exista:
//   - vite.config.js esbuild `drop: ['console']` sterge ORICE `console.*` din
//     bundle-ul de productie (§1-C2). Asta inseamna ca pana si `console.error`
//     dispare in prod — gresit: erorile trebuie sa ajunga in consola prod + Sentry.
//   - Acest modul acceseaza consola prin `globalThis.console`, pe care esbuild
//     NU il prinde in pattern-ul de drop. Astfel `logger.error` chiar emite in prod.
//
// Reguli:
//   - debug/info/log → tacut DOAR in build-ul de productie. Zgomot in prod.
//   - warn          → la fel, tacut doar in prod.
//   - error         → INTOTDEAUNA. Trebuie sa ajunga la observabilitate prod.
//
// Gate = "NU productie" (IS_PROD === false), nu "DEV === true": asa dev-server SI
// vitest emit diagnostice, doar `vite build` le suprima. Flag-ul vine din ./env
// (shim per-bundler): Vite/Vitest citesc import.meta.env acolo, RN foloseste
// `__DEV__` via env.web.js/env.native.js — fara `import.meta` in graful RN.
import { IS_PROD } from './env';

const isDev = !IS_PROD;

// Referinta indirecta — esbuild drop-ul tinteste identificatorul global `console`,
// nu `globalThis.console`. Captura aici supravietuieste minify-ului prod.
const c = globalThis.console;

export const logger = {
  debug: (...args) => { if (isDev) c.debug(...args); },
  info: (...args) => { if (isDev) c.info(...args); },
  log: (...args) => { if (isDev) c.log(...args); },
  warn: (...args) => { if (isDev) c.warn(...args); },
  error: (...args) => { c.error(...args); },
};

export default logger;

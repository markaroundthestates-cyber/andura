// ══ PLURAL RO — Romanian plural form helper ═══════════════════════════════
// §11-H3 audit fix — Romanian plural rules (Intl.PluralRules ro-RO):
//   - 1 → singular (1 zi)
//   - 2-19 → plural (2 zile, 19 zile)
//   - 20+ → "de" + plural (20 de zile, 100 de zile)
//
// Edge cases:
//   - 0 → "de" + plural (0 zile = "0 de zile" in strict spec, but UX
//     commonly "0 zile" — keep "0 zile" for natural readability)
//
// Usage:
//   pluralRo(1, 'zi', 'zile')          → '1 zi'
//   pluralRo(2, 'zi', 'zile')          → '2 zile'
//   pluralRo(20, 'zi', 'zile')         → '20 de zile'
//   pluralRo(1, 'sesiune', 'sesiuni')  → '1 sesiune'

export function pluralRo(n: number, singular: string, plural: string): string {
  const absN = Math.abs(Math.trunc(n));
  if (absN === 1) return `${n} ${singular}`;
  if (absN >= 2 && absN <= 19) return `${n} ${plural}`;
  if (absN === 0) return `${n} ${plural}`; // UX: "0 zile" preferred over "0 de zile"
  return `${n} de ${plural}`;
}

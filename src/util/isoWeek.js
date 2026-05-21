/**
 * ISO 8601 week calculation.
 * Returns 'YYYY-Www' string for any input date.
 *
 * Accepts: ISO date string ('YYYY-MM-DD'), Unix timestamp (ms), or Date object.
 * Throws on null, undefined, or unparseable input.
 *
 * Algorithm: Thursday rule (week containing first Thursday of year is week 1).
 *
 * @param {string | number | Date} date
 * @returns {string}
 */
export function isoWeek(date) {
  if (date === null || date === undefined) throw new Error(`isoWeek: invalid date input: ${date}`);
  const d = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) throw new Error(`isoWeek: invalid date input: ${date}`);

  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);

  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));

  const week = Math.floor((thursday.getTime() - startOfWeek1.getTime()) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

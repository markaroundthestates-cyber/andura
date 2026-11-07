// ══ DOWNLOAD — save a text payload as a file on the device ═══════════════════
// Founder 2026-11-07: the debug-log "last 3 workouts" / "full raw history" exports
// are too big for the clipboard on a phone; they download as a .json file instead.

/** Save `content` as `filename` (Blob + a temporary anchor). Throws if the browser refuses. */
export function downloadTextFile(filename: string, content: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** "2026-11-07-1830" in local time, for file names. */
export function fileStamp(d: Date = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

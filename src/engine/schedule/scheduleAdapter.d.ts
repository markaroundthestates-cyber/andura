// Phase 5 task_05 — TS ambient types pentru scheduleAdapter consumed React-side.
// Per task_11 pattern (.d.ts sibling JS engine module).

export type DayKind = 'training' | 'rest';

export function mapDateToIndex(date: Date | string): number;
export function getCalendarOverride(now?: Date): DayKind[] | null;
export function getMissingEquipment(): string[];

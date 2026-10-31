// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** Calendar days in the server's local time zone, as Unix-second ranges. */

export type Day = { label: string; from: number; to: number };

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number): string => String(value).padStart(2, "0");

export function formatDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTime(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parses `YYYY-MM-DD`; returns null for anything else, including 2024-02-30. */
export function parseDay(text: string): Day | null {
  const match = DAY_PATTERN.exec(text);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  const start = new Date(year, month - 1, day);
  if (start.getMonth() !== month - 1 || start.getDate() !== day) return null;

  // The next midnight, not start + 24h, so days around a DST change stay whole.
  const end = new Date(year, month - 1, day + 1);
  return { label: text, from: start.getTime() / 1000, to: end.getTime() / 1000 };
}

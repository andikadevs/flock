// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { flushSync } from "react-dom";

const DURATION_MS = 400;

/** Runs a DOM-changing update as a circle growing out of `origin`. */
export async function revealFrom(origin: Element | null, update: () => void): Promise<void> {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reducedMotion) {
    update();
    return;
  }

  await document.startViewTransition(() => flushSync(update)).ready;

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: DURATION_MS, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
  );
}

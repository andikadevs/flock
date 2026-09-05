/**
 * Decides whether a crashed bot is retried and how long to wait. Pure bookkeeping,
 * deliberately separate from the manager so the rule is readable and testable.
 */

const RESTART_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000];

/** A process that survived this long was healthy; a late crash starts a fresh budget. */
const HEALTHY_UPTIME_MS = 60_000;

export type RestartDecision =
  | { action: "restart"; delayMs: number; attempt: number }
  | { action: "give-up"; attempts: number };

export class RestartPolicy {
  private attempts = new Map<string, number>();

  /** Record a crash and decide what happens next. */
  onCrash(botId: string, uptimeMs: number): RestartDecision {
    if (uptimeMs > HEALTHY_UPTIME_MS) this.attempts.delete(botId);

    const attempt = (this.attempts.get(botId) ?? 0) + 1;
    const delayMs = RESTART_DELAYS_MS[attempt - 1];

    if (delayMs === undefined) {
      this.attempts.delete(botId);
      return { action: "give-up", attempts: attempt - 1 };
    }

    this.attempts.set(botId, attempt);
    return { action: "restart", delayMs, attempt };
  }

  clear(botId: string): void {
    this.attempts.delete(botId);
  }
}

/** Validation of bot payloads. Routes stay free of shape checking. */

import { isHandlerKey } from "../../bots/handlers/index.ts";
import type { BotMode } from "../../bots/types.ts";

export type CreateBotInput = {
  name: string;
  token: string;
  handlerKey: string;
  mode: BotMode;
};

export type UpdateBotInput = {
  name?: string;
  handlerKey?: string;
  mode?: BotMode;
  token?: string;
  enabled?: boolean;
};

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const MODES: BotMode[] = ["webhook", "polling"];

const isMode = (value: unknown): value is BotMode => MODES.includes(value as BotMode);

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function parseCreate(body: unknown): Parsed<CreateBotInput> {
  const input = body as Partial<CreateBotInput>;

  if (!isText(input?.name)) return { ok: false, error: "A name is required." };
  if (!isText(input.token)) return { ok: false, error: "A bot token is required." };
  if (!isText(input.handlerKey) || !isHandlerKey(input.handlerKey)) {
    return { ok: false, error: "Unknown handler." };
  }
  if (!isMode(input.mode)) return { ok: false, error: "Mode must be webhook or polling." };

  return {
    ok: true,
    value: {
      name: input.name.trim(),
      token: input.token.trim(),
      handlerKey: input.handlerKey,
      mode: input.mode,
    },
  };
}

export function parseUpdate(body: unknown): Parsed<UpdateBotInput> {
  const input = body as Partial<UpdateBotInput>;
  const value: UpdateBotInput = {};

  if (input?.name !== undefined) {
    if (!isText(input.name)) return { ok: false, error: "A name cannot be empty." };
    value.name = input.name.trim();
  }
  if (input?.handlerKey !== undefined) {
    if (!isText(input.handlerKey) || !isHandlerKey(input.handlerKey)) {
      return { ok: false, error: "Unknown handler." };
    }
    value.handlerKey = input.handlerKey;
  }
  if (input?.mode !== undefined) {
    if (!isMode(input.mode)) return { ok: false, error: "Mode must be webhook or polling." };
    value.mode = input.mode;
  }
  if (input?.token !== undefined) {
    if (!isText(input.token)) return { ok: false, error: "A token cannot be empty." };
    value.token = input.token.trim();
  }
  if (input?.enabled !== undefined) {
    if (typeof input.enabled !== "boolean") return { ok: false, error: "`enabled` must be boolean." };
    value.enabled = input.enabled;
  }

  return { ok: true, value };
}

/** Fields whose change requires the runner to be restarted. */
export function needsRestart(input: UpdateBotInput): boolean {
  return input.token !== undefined || input.handlerKey !== undefined || input.mode !== undefined;
}

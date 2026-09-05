/** Administrative CRUD over bots. Every route is session-authenticated. */

import { catalog } from "../../bots/handlers/index.ts";
import type { BotManager } from "../../bots/manager.ts";
import type { BotMode } from "../../bots/types.ts";
import { config } from "../../config.ts";
import { encryptToken, randomSecret } from "../../crypto.ts";
import * as audit from "../../db/audit.repo.ts";
import * as bots from "../../db/bots.repo.ts";
import * as events from "../../db/events.repo.ts";
import * as telegram from "../../telegram/gateway.ts";
import { badRequest, created, noContent, notFound, ok } from "../responses.ts";
import { authenticated } from "../session.ts";
import { needsRestart, parseCreate, parseUpdate } from "./bot.input.ts";

async function readJson(req: Request): Promise<unknown> {
  return await req.json().catch(() => null);
}

/** Webhook mode is only meaningful if Telegram has somewhere to deliver to. */
function webhookUnavailable(mode: BotMode | undefined): boolean {
  return mode === "webhook" && !config.publicUrl;
}

export function botRoutes(manager: BotManager) {
  const list = authenticated(async () => ok(await manager.snapshot()));

  const create = authenticated(async (req, session) => {
    const parsed = parseCreate(await readJson(req));
    if (!parsed.ok) return badRequest(parsed.error);
    if (webhookUnavailable(parsed.value.mode)) {
      return badRequest("Webhook mode needs PUBLIC_URL to be configured.");
    }

    // Validating with Telegram first keeps unusable tokens out of the database.
    let identity: telegram.BotIdentity;
    try {
      identity = await telegram.identify(parsed.value.token);
    } catch (err) {
      return badRequest(`Telegram rejected the token: ${(err as Error).message}`);
    }

    const record = await bots.create({
      name: parsed.value.name,
      username: identity.username,
      tokenEnc: encryptToken(parsed.value.token),
      handlerKey: parsed.value.handlerKey,
      mode: parsed.value.mode,
      webhookSecret: randomSecret(),
    });

    await audit.record(session.actor, "bot.create", record.id, { name: record.name });
    return created({ id: record.id });
  });

  const update = authenticated<"/api/bots/:id">(async (req, session) => {
    const { id } = req.params;
    const record = await bots.find(id);
    if (!record) return notFound("No such bot.");

    const parsed = parseUpdate(await readJson(req));
    if (!parsed.ok) return badRequest(parsed.error);
    const input = parsed.value;

    if (webhookUnavailable(input.mode)) {
      return badRequest("Webhook mode needs PUBLIC_URL to be configured.");
    }

    if (input.token) {
      try {
        await telegram.identify(input.token);
      } catch (err) {
        return badRequest(`Telegram rejected the token: ${(err as Error).message}`);
      }
      await bots.updateToken(id, encryptToken(input.token));
    }

    await bots.updateSettings(id, {
      name: input.name ?? record.name,
      handlerKey: input.handlerKey ?? record.handlerKey,
      mode: input.mode ?? record.mode,
    });

    if (input.enabled !== undefined && input.enabled !== record.enabled) {
      await bots.setEnabled(id, input.enabled);
      await audit.record(session.actor, input.enabled ? "bot.enable" : "bot.disable", id);
      await manager.reconcile();
    } else if (needsRestart(input) && record.enabled) {
      await manager.restart(id);
    }

    await audit.record(session.actor, "bot.update", id, { fields: Object.keys(input) });
    return ok(await manager.snapshot());
  });

  const destroy = authenticated<"/api/bots/:id">(async (req, session) => {
    const { id } = req.params;
    if (!(await bots.find(id))) return notFound("No such bot.");

    await bots.setEnabled(id, false);
    await manager.reconcile();
    await bots.remove(id);
    await audit.record(session.actor, "bot.delete", id);
    return noContent();
  });

  const listEvents = authenticated<"/api/bots/:id/events">(async req => {
    const { id } = req.params;
    return ok(await events.listFor(id));
  });

  return {
    "/api/handlers": { GET: authenticated(() => ok(catalog())) },
    "/api/bots": { GET: list, POST: create },
    "/api/bots/:id": { PATCH: update, DELETE: destroy },
    "/api/bots/:id/events": { GET: listEvents },
  };
}

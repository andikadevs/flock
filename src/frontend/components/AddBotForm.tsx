import { useState } from "react";
import type { BotMode } from "../../server/bots/types.ts";
import { api, type HandlerInfo } from "../api.ts";

type AddBotFormProps = {
  handlers: HandlerInfo[];
  onAdded: () => void;
  onCancel: () => void;
};

const FIELD =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export function AddBotForm({ handlers, onAdded, onCancel }: AddBotFormProps) {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [handlerKey, setHandlerKey] = useState(handlers[0]?.key ?? "");
  const [mode, setMode] = useState<BotMode>("polling");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.createBot({ name, token, handlerKey, mode });
      onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Name">
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            required
            autoFocus
            placeholder="Support bot"
            className={FIELD}
          />
        </Field>

        <Field label="Token" hint="Stored encrypted, never shown again.">
          <input
            value={token}
            onChange={event => setToken(event.target.value)}
            required
            type="password"
            autoComplete="off"
            placeholder="123456789:AA…"
            className={FIELD}
          />
        </Field>

        <Field label="Handler">
          <select
            value={handlerKey}
            onChange={event => setHandlerKey(event.target.value)}
            className={FIELD}
          >
            {handlers.map(handler => (
              <option key={handler.key} value={handler.key}>
                {handler.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Delivery">
          <select
            value={mode}
            onChange={event => setMode(event.target.value as BotMode)}
            className={FIELD}
          >
            <option value="polling">Long polling</option>
            <option value="webhook">Webhook</option>
          </select>
        </Field>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-5 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || handlers.length === 0}
          className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Checking token…" : "Add bot"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3.5 py-2 text-sm text-ink-muted transition hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

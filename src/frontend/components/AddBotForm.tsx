import { useState } from "react";
import type { BotMode } from "../../server/bots/types.ts";
import { api, type HandlerInfo } from "../api.ts";

type AddBotFormProps = {
  handlers: HandlerInfo[];
  onAdded: () => void;
};

export function AddBotForm({ handlers, onAdded }: AddBotFormProps) {
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
      setName("");
      setToken("");
      onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-200">Add a bot</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Name">
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            required
            placeholder="Support bot"
            className={INPUT}
          />
        </Field>

        <Field label="Token" hint="Stored encrypted; never shown again.">
          <input
            value={token}
            onChange={event => setToken(event.target.value)}
            required
            type="password"
            autoComplete="off"
            placeholder="123456789:AA..."
            className={INPUT}
          />
        </Field>

        <Field label="Handler">
          <select
            value={handlerKey}
            onChange={event => setHandlerKey(event.target.value)}
            className={INPUT}
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
            className={INPUT}
          >
            <option value="polling">Long polling</option>
            <option value="webhook">Webhook</option>
          </select>
        </Field>
      </div>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={saving || handlers.length === 0}
        className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {saving ? "Checking token…" : "Add bot"}
      </button>
    </form>
  );
}

const INPUT =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

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
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

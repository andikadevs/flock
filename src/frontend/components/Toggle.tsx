type ToggleProps = {
  checked: boolean;
  busy?: boolean;
  label: string;
  onChange: (next: boolean) => void;
};

/** A switch alone reads ambiguously at a glance, so the state is also written out. */
export function Toggle({ checked, busy = false, label, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={busy}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2 disabled:opacity-40"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-neutral-300 group-hover:bg-neutral-400"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span
        className={`w-6 text-left text-sm ${checked ? "text-ink" : "text-ink-muted"}`}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}

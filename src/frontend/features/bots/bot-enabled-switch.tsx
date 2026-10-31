import { Label } from "@/frontend/components/ui/label.tsx";
import { Switch } from "@/frontend/components/ui/switch.tsx";

type BotEnabledSwitchProps = {
  botId: string;
  botName: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

/** A switch alone reads ambiguously at a glance, so the state is also written out. */
export function BotEnabledSwitch({ botId, botName, enabled, onChange }: BotEnabledSwitchProps) {
  const id = `bot-enabled-${botId}`;

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onChange}
        aria-label={`Enable ${botName}`}
      />
      <Label htmlFor={id} className="w-6 text-muted-foreground">
        {enabled ? "On" : "Off"}
      </Label>
    </div>
  );
}

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/frontend/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog.tsx";
import { errorMessage } from "@/frontend/lib/errors.ts";
import { AddBotForm } from "./add-bot-form.tsx";
import { botsApi, type CreateBotInput } from "./api.ts";
import { useHandlers } from "./use-handlers.ts";

const FORM_ID = "add-bot-form";

export function AddBotDialog({ onAdded }: { onAdded: () => void }) {
  const handlers = useHandlers();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) setError(null);
  };

  const create = async (input: CreateBotInput) => {
    setSaving(true);
    setError(null);
    try {
      await botsApi.create(input);
      toast.success(`Added ${input.name}.`);
      changeOpen(false);
      onAdded();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add bot
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add bot</DialogTitle>
          <DialogDescription>The token is checked with Telegram before saving.</DialogDescription>
        </DialogHeader>

        {/* Remounts on each open, so a cancelled draft never leaks into the next one. */}
        {open && (
          <AddBotForm
            id={FORM_ID}
            handlers={handlers}
            error={error}
            onSubmit={input => void create(input)}
          />
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form={FORM_ID} disabled={saving || handlers.length === 0}>
            {saving ? "Checking token…" : "Add bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

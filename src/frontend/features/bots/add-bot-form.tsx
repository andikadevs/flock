import { useState } from "react";
import type { BotMode } from "@/server/bots/types.ts";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/frontend/components/ui/field.tsx";
import { Input } from "@/frontend/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select.tsx";
import type { CreateBotInput, HandlerInfo } from "./api.ts";

const MODES: { value: BotMode; label: string }[] = [
  { value: "polling", label: "Long polling" },
  { value: "webhook", label: "Webhook" },
];

type AddBotFormProps = {
  id: string;
  handlers: HandlerInfo[];
  error: string | null;
  onSubmit: (input: CreateBotInput) => void;
};

/** Collects a new bot's details. Submission is the caller's job; the form only validates. */
export function AddBotForm({ id, handlers, error, onSubmit }: AddBotFormProps) {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [handlerKey, setHandlerKey] = useState(handlers[0]?.key ?? "");
  const [mode, setMode] = useState<BotMode>("polling");

  const handlerItems = handlers.map(handler => ({ value: handler.key, label: handler.label }));
  const selectedHandler = handlers.find(handler => handler.key === handlerKey);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), token: token.trim(), handlerKey, mode });
  };

  return (
    <form id={id} onSubmit={submit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="bot-name">Name</FieldLabel>
          <Input
            id="bot-name"
            value={name}
            onChange={event => setName(event.target.value)}
            required
            autoFocus
            placeholder="Support bot"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="bot-token">Token</FieldLabel>
          <Input
            id="bot-token"
            value={token}
            onChange={event => setToken(event.target.value)}
            required
            type="password"
            autoComplete="off"
            placeholder="123456789:AA…"
          />
          <FieldDescription>From BotFather. Stored encrypted, never shown again.</FieldDescription>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Handler</FieldLabel>
            <Select
              items={handlerItems}
              value={handlerKey}
              onValueChange={value => setHandlerKey(value as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a handler" />
              </SelectTrigger>
              <SelectContent>
                {handlerItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Delivery</FieldLabel>
            <Select items={MODES} value={mode} onValueChange={value => setMode(value as BotMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {selectedHandler && <FieldDescription>{selectedHandler.description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>
    </form>
  );
}

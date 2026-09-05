/**
 * Isolation is a rule about the code, not just about processes: one bot must never
 * reach into another bot's folder. Shared behaviour goes through `shared/`.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { handlers } from "./index.ts";

const HANDLER_DIR = new URL(".", import.meta.url).pathname;
const NOT_A_BOT = new Set(["shared"]);

const botFolders = readdirSync(HANDLER_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !NOT_A_BOT.has(entry.name))
  .map(entry => entry.name);

const filesIn = (folder: string): string[] =>
  [...new Bun.Glob("**/*.ts").scanSync(`${HANDLER_DIR}${folder}`)].map(
    file => `${HANDLER_DIR}${folder}/${file}`,
  );

const importsIn = (source: string): string[] =>
  [...source.matchAll(/from\s+"([^"]+)"/g)].map(match => match[1]!);

describe("bot handlers", () => {
  test("every bot folder is registered", () => {
    expect(botFolders.toSorted()).toEqual(Object.keys(handlers).toSorted());
  });

  test.each(botFolders)("%s does not import another bot", folder => {
    const siblings = botFolders.filter(other => other !== folder);

    for (const file of filesIn(folder)) {
      const offending = importsIn(readFileSync(file, "utf8")).filter(specifier =>
        siblings.some(sibling => specifier.includes(`/${sibling}/`)),
      );
      expect(offending, `${file} reaches into another bot`).toEqual([]);
    }
  });

  test.each(botFolders)("%s exports a usable handler", folder => {
    const handler = handlers[folder]!;
    expect(handler.label.length).toBeGreaterThan(0);
    expect(handler.description.length).toBeGreaterThan(0);
    expect(typeof handler.register).toBe("function");
  });
});

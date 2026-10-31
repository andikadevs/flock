// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Bot tokens are stored encrypted at rest. A leaked database dump alone must not
 * hand an attacker control of every bot.
 */

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "./config.ts";

const ALGORITHM = "aes-256-gcm";

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, config.tokenKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map(b => b.toString("base64url")).join(".");
}

export function decryptToken(stored: string): string {
  const [iv, tag, ciphertext] = stored.split(".").map(part => Buffer.from(part, "base64url"));
  if (!iv || !tag || !ciphertext) throw new Error("Malformed encrypted token.");
  const decipher = createDecipheriv(ALGORITHM, config.tokenKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/** `123456789:AAE...` -> `123456789:AAE***xyz`, safe to show in the dashboard. */
export function maskToken(token: string): string {
  const [id, secret] = token.split(":");
  if (!id || !secret) return "***";
  return `${id}:${secret.slice(0, 3)}***${secret.slice(-3)}`;
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function randomSecret(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

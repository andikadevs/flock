// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Who has been asked for feedback and has not sent it yet.
 *
 * Plain process memory is safe here precisely because each bot runs in its own
 * process: this map belongs to one bot and one bot only. It is also deliberately
 * forgotten on restart, which is the right trade for a half-finished message.
 */

const awaiting = new Set<number>();

export function expectMessageFrom(chatId: number): void {
  awaiting.add(chatId);
}

export function takeExpectation(chatId: number): boolean {
  return awaiting.delete(chatId);
}

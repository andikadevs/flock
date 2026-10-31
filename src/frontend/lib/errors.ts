// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

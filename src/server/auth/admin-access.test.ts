import { expect, test } from "bun:test";
import { isAdmin } from "./admin-access.ts";

test("admits an allowlisted email", () => {
  expect(isAdmin({ sub: "someone", email: "Admin@Example.com", name: null })).toBe(true);
});

test("admits an allowlisted subject without an email", () => {
  expect(isAdmin({ sub: "admin-subject", email: null, name: null })).toBe(true);
});

test("rejects anyone else", () => {
  expect(isAdmin({ sub: "someone", email: "other@example.com", name: null })).toBe(false);
});

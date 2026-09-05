/** The single Postgres connection pool, via Bun's built-in SQL client. */

import { SQL } from "bun";
import { config } from "../config.ts";

export const sql = new SQL(config.databaseUrl);

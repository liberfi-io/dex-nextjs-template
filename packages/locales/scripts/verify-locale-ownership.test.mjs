import assert from "node:assert/strict";
import { verifyOwnership } from "./verify-locale-ownership.mjs";

const rows = await verifyOwnership();
assert.equal(rows.length, 864);
assert.equal(new Set(rows.map((row) => row.key)).size, rows.length);
assert.ok(rows.every((row) => row.owner));
assert.ok(rows.filter((row) => row.owner !== "application").every((row) => row.sdk_key));

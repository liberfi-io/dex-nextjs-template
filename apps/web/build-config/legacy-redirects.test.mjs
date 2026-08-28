import assert from "node:assert/strict";
import test from "node:test";
import { LEGACY_REDIRECTS } from "./legacy-redirects.mjs";

const bySource = Object.fromEntries(
  LEGACY_REDIRECTS.map((entry) => [entry.source, entry.destination]),
);

test("maps every frozen leftover legacy URL onto the current (new) route", () => {
  assert.equal(bySource["/legacy-home"], "/");
  assert.equal(bySource["/legacy/account"], "/portfolio");
  assert.equal(bySource["/legacy/channels"], "/channels");
  assert.equal(bySource["/legacy/channels/create"], "/channels/create");
  assert.equal(bySource["/legacy/channels/:id"], "/channels/:id");
  assert.equal(bySource["/legacy/channels/:id/update"], "/channels/:id/update");
  assert.equal(bySource["/legacy/predict/:id"], "/predict/kalshi/:id");
  assert.equal(bySource["/legacy/redpacket"], "/redpacket");
  assert.equal(bySource["/legacy/redpacket/create"], "/redpacket/create");
  assert.equal(bySource["/legacy/redpacket/histories"], "/redpacket/histories");
  assert.equal(bySource["/legacy/tokens"], "/tokens");
  assert.equal(bySource["/legacy/tokens/:path*"], "/tokens/:path*");
});

test("uses permanent redirects so old bookmarks collapse onto the new shell", () => {
  assert.ok(LEGACY_REDIRECTS.every((entry) => entry.permanent === true));
});

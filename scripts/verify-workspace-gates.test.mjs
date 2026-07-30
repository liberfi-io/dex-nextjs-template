import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { findWarningRegressions } from "./verify-lint-baseline.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sourceWorkspaces() {
  return ["apps", "packages"].flatMap((directory) =>
    readdirSync(join(root, directory), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(root, directory, entry.name))
      .filter(
        (workspace) =>
          existsSync(join(workspace, "package.json")) &&
          existsSync(join(workspace, "src")),
      ),
  );
}

test("source workspaces expose real typecheck, lint, and test gates", () => {
  const invalid = [];

  for (const workspace of sourceWorkspaces()) {
    const manifest = readJson(join(workspace, "package.json"));

    for (const script of ["typecheck", "lint", "test"]) {
      const command = manifest.scripts?.[script];

      if (!command || /\becho\b/.test(command)) {
        invalid.push(`${manifest.name}: ${script}`);
      }
      if (script === "test" && /\bdlx\b/.test(command)) {
        invalid.push(`${manifest.name}: test uses dlx`);
      }
    }
  }

  assert.deepEqual(invalid, []);
});

test("root exposes typecheck, lint, and test gates", () => {
  const manifest = readJson(join(root, "package.json"));

  for (const script of ["typecheck", "lint", "test"]) {
    assert.equal(typeof manifest.scripts?.[script], "string");
  }

  assert.match(manifest.scripts.test, /\bturbo run test\b/);
  assert.equal(manifest.devDependencies.jest, "30.2.0");
  assert.equal(manifest.devDependencies["jest-environment-jsdom"], "30.2.0");
  assert.equal(manifest.devDependencies["babel-jest"], "30.2.0");
  assert.equal(manifest.devDependencies["@babel/preset-react"], "7.28.5");
  assert.equal(manifest.devDependencies["@babel/preset-typescript"], "7.28.5");

  const webManifest = readJson(join(root, "apps/web/package.json"));
  assert.equal(webManifest.devDependencies["@testing-library/react"], "16.3.2");
  assert.equal(webManifest.devDependencies["@testing-library/jest-dom"], "6.9.1");
});

test("lint baseline permits reductions but rejects new warnings", () => {
  assert.deepEqual(findWarningRegressions({ "a\trule": 2 }, { "a\trule": 1 }), []);
  assert.deepEqual(findWarningRegressions({}, { "a\trule": 1 }), [
    "a\trule: 1 warning(s), baseline 0",
  ]);
});

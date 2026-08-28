import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { getLocalSdkAliasEntries, getLocalSdkAliases } from "./local-sdk-aliases.mjs";
import { REQUIRED_SINGLETON_ENTRYPOINTS, getSingletonAliases } from "./local-sdk-shared.mjs";
import { createLocalSdkFixture } from "./local-sdk-fixture.mjs";

function withLocalSdk(root, callback) {
  const previous = {
    USE_LOCAL_SDK: process.env.USE_LOCAL_SDK,
    NODE_ENV: process.env.NODE_ENV,
    LOCAL_SDK_ROOT: process.env.LOCAL_SDK_ROOT,
  };
  process.env.USE_LOCAL_SDK = "true";
  process.env.NODE_ENV = "development";
  process.env.LOCAL_SDK_ROOT = root;
  try {
    return callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("classifies root, subpath, CSS and generated locale aliases", () => {
  const fixture = createLocalSdkFixture();
  try {
    const entries = withLocalSdk(fixture.root, () =>
      getLocalSdkAliasEntries({ baseDir: fixture.root }),
    );
    const byEntrypoint = new Map(entries.map((entry) => [entry.entrypoint, entry]));

    assert.equal(byEntrypoint.get("@liberfi.io/example$")?.source, "src");
    assert.equal(byEntrypoint.get("@liberfi.io/example/client$")?.source, "src");
    assert.equal(byEntrypoint.get("@liberfi.io/example/styles.css$")?.source, "src");
    assert.equal(byEntrypoint.get("@liberfi.io/example/locales")?.source, "generated");
    assert.match(byEntrypoint.get("@liberfi.io/example/locales")?.target ?? "", /dist\/locales$/);
  } finally {
    fixture.cleanup();
  }
});

test("resolves every wallet-connector public entrypoint from one package tree", () => {
  const fixture = createLocalSdkFixture();
  try {
    const aliases = withLocalSdk(fixture.root, () =>
      getLocalSdkAliases({ baseDir: fixture.root, logger: () => undefined }),
    );
    const walletTargets = Object.entries(aliases)
      .filter(([entrypoint]) => entrypoint.startsWith("@liberfi.io/wallet-connector"))
      .map(([, target]) => target);

    assert.equal(walletTargets.length, 3);
    assert.ok(walletTargets.every((target) => target.startsWith(fixture.walletPackageDir)));
    assert.equal(
      new Set(walletTargets.map((target) => path.relative(fixture.root, target).split(path.sep)[1]))
        .size,
      1,
    );
  } finally {
    fixture.cleanup();
  }
});

test("pins the complete third-party singleton contract", () => {
  const aliases = getSingletonAliases({ baseDir: path.resolve("apps/web") });

  assert.deepEqual(Object.keys(aliases).sort(), [...REQUIRED_SINGLETON_ENTRYPOINTS].sort());
  for (const target of Object.values(aliases)) {
    assert.match(target, /node_modules/);
  }
});

test("never resolves one entrypoint from both source and dist", () => {
  const fixture = createLocalSdkFixture();
  try {
    const entries = withLocalSdk(fixture.root, () =>
      getLocalSdkAliasEntries({ baseDir: fixture.root }),
    );
    const grouped = Map.groupBy(entries, (entry) => entry.entrypoint);

    for (const candidates of grouped.values()) {
      assert.equal(candidates.length, 1);
      assert.ok(
        !(
          candidates.some((entry) => entry.source === "src") &&
          candidates.some((entry) => entry.source === "dist")
        ),
      );
    }
  } finally {
    fixture.cleanup();
  }
});

test("local SDK scan includes unpublished launchpad and redpacket packages", () => {
  const sdkRoot = path.resolve("..", "react-sdk");
  const entries = withLocalSdk(sdkRoot, () =>
    getLocalSdkAliasEntries({ baseDir: path.resolve("apps/web") }),
  );
  const names = new Set(entries.map((entry) => entry.entrypoint));
  assert.ok(names.has("@liberfi.io/react-launchpad$"));
  assert.ok(names.has("@liberfi.io/react-redpacket$"));
  assert.ok(names.has("@liberfi.io/ui-launchpad$"));
  assert.ok(names.has("@liberfi.io/ui-redpacket$"));
});

test("logs entrypoint source kinds without exposing an absolute SDK path", () => {
  const fixture = createLocalSdkFixture();
  try {
    const messages = [];
    withLocalSdk(fixture.root, () =>
      getLocalSdkAliases({ baseDir: fixture.root, logger: (message) => messages.push(message) }),
    );

    assert.ok(messages.some((message) => message.includes("source=src")));
    assert.ok(messages.some((message) => message.includes("source=generated")));
    assert.ok(messages.every((message) => !message.includes(fixture.root)));
  } finally {
    fixture.cleanup();
  }
});

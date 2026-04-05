#!/usr/bin/env node

/**
 * SDK Link Manager
 *
 * Switches @liberfi.io/* dependencies between local source (link:)
 * and npm registry versions for development / release workflows.
 *
 * Usage:
 *   node scripts/sdk-link.mjs link [pkg...]   # link specific or all packages
 *   node scripts/sdk-link.mjs unlink           # restore npm versions
 *   node scripts/sdk-link.mjs status           # show current link state
 *
 * Examples:
 *   node scripts/sdk-link.mjs link ui-perpetuals ui-tokens
 *   node scripts/sdk-link.mjs link --all
 *   node scripts/sdk-link.mjs unlink
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REACT_SDK_ROOT = resolve(ROOT, "../react-sdk");
const WEB_PKG_PATH = resolve(ROOT, "apps/web/package.json");
const STATE_FILE = resolve(ROOT, ".sdk-link-state.json");

const SCOPE = "@liberfi.io/";

// Directory name in react-sdk/packages/ for each @liberfi.io/* package
const PKG_DIR_MAP = {
  "@liberfi.io/client": "client",
  "@liberfi.io/hooks": "hooks",
  "@liberfi.io/i18n": "i18n",
  "@liberfi.io/react": "react",
  "@liberfi.io/react-predict": "react-predict",
  "@liberfi.io/types": "types",
  "@liberfi.io/ui": "ui",
  "@liberfi.io/ui-chain-select": "ui-chain-select",
  "@liberfi.io/ui-channels": "ui-channels",
  "@liberfi.io/ui-media-track": "ui-media-track",
  "@liberfi.io/ui-perpetuals": "ui-perpetuals",
  "@liberfi.io/ui-portfolio": "ui-portfolio",
  "@liberfi.io/ui-predict": "ui-predict",
  "@liberfi.io/ui-scaffold": "ui-scaffold",
  "@liberfi.io/ui-tokens": "ui-tokens",
  "@liberfi.io/ui-trade": "ui-trade",
  "@liberfi.io/ui-tradingview": "ui-tradingview",
  "@liberfi.io/utils": "utils",
  "@liberfi.io/wallet-connector": "wallet-connector",
  "@liberfi.io/wallet-connector-privy": "wallet-connector-privy",
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function getLinkPath(pkgName) {
  const dir = PKG_DIR_MAP[pkgName];
  if (!dir) return null;
  // Relative from apps/web/ to react-sdk/packages/<dir>
  return `link:../../../react-sdk/packages/${dir}`;
}

function getSdkDeps(pkg) {
  const deps = pkg.dependencies || {};
  return Object.keys(deps).filter((k) => k.startsWith(SCOPE));
}

function loadState() {
  if (!existsSync(STATE_FILE)) return null;
  return readJson(STATE_FILE);
}

function saveState(state) {
  writeJson(STATE_FILE, state);
}

function resolvePackageNames(args, allSdkDeps) {
  if (args.includes("--all")) return allSdkDeps;

  return args.map((shortName) => {
    if (shortName.startsWith(SCOPE)) return shortName;
    // Accept short names like "ui-perpetuals" → "@liberfi.io/ui-perpetuals"
    const full = SCOPE + shortName;
    if (allSdkDeps.includes(full)) return full;
    console.error(`❌ Package "${shortName}" not found in dependencies.`);
    console.error(`   Available: ${allSdkDeps.map((d) => d.replace(SCOPE, "")).join(", ")}`);
    process.exit(1);
  });
}

// ── Commands ──

function cmdLink(args) {
  const pkg = readJson(WEB_PKG_PATH);
  const allSdkDeps = getSdkDeps(pkg);

  if (args.length === 0) {
    console.log("Usage: sdk-link.mjs link [--all | pkg1 pkg2 ...]");
    console.log(`Available packages: ${allSdkDeps.map((d) => d.replace(SCOPE, "")).join(", ")}`);
    process.exit(0);
  }

  const toLink = resolvePackageNames(args, allSdkDeps);

  // Validate react-sdk paths exist
  for (const name of toLink) {
    const dir = PKG_DIR_MAP[name];
    const pkgDir = resolve(REACT_SDK_ROOT, "packages", dir);
    if (!existsSync(pkgDir)) {
      console.error(`❌ Local package not found: ${pkgDir}`);
      console.error(`   Make sure react-sdk is at: ${REACT_SDK_ROOT}`);
      process.exit(1);
    }
  }

  // Save original versions
  const state = loadState() || { originalVersions: {} };
  for (const name of toLink) {
    if (!state.originalVersions[name]) {
      state.originalVersions[name] = pkg.dependencies[name];
    }
  }
  saveState(state);

  // Apply link: protocol
  let changed = 0;
  for (const name of toLink) {
    const linkPath = getLinkPath(name);
    if (pkg.dependencies[name] !== linkPath) {
      const prev = pkg.dependencies[name];
      pkg.dependencies[name] = linkPath;
      console.log(`🔗 ${name}: ${prev} → ${linkPath}`);
      changed++;
    } else {
      console.log(`⏭  ${name}: already linked`);
    }
  }

  if (changed > 0) {
    writeJson(WEB_PKG_PATH, pkg);
    console.log(`\n✅ Linked ${changed} package(s). Run:\n`);
    console.log("   pnpm install --no-frozen-lockfile");
    console.log("   # Then in react-sdk, for each linked package:");
    console.log("   # cd packages/<name> && pnpm dev");
  } else {
    console.log("\nNothing to change.");
  }
}

function cmdUnlink() {
  const state = loadState();
  if (!state || Object.keys(state.originalVersions).length === 0) {
    console.log("No linked packages to restore.");
    return;
  }

  const pkg = readJson(WEB_PKG_PATH);
  let changed = 0;

  for (const [name, version] of Object.entries(state.originalVersions)) {
    if (pkg.dependencies[name] && pkg.dependencies[name] !== version) {
      console.log(`📦 ${name}: ${pkg.dependencies[name]} → ${version}`);
      pkg.dependencies[name] = version;
      changed++;
    }
  }

  if (changed > 0) {
    writeJson(WEB_PKG_PATH, pkg);
    writeJson(STATE_FILE, { originalVersions: {} });
    console.log(`\n✅ Restored ${changed} package(s) to npm versions. Run:\n`);
    console.log("   nrm use npm");
    console.log("   pnpm install --no-frozen-lockfile");
    console.log("   pnpm build");
    console.log("   nrm use taobao");
  } else {
    console.log("All packages already using npm versions.");
  }
}

function cmdStatus() {
  const pkg = readJson(WEB_PKG_PATH);
  const allSdkDeps = getSdkDeps(pkg);
  const state = loadState();

  console.log("@liberfi.io/* dependency status:\n");

  const linked = [];
  const npm = [];

  for (const name of allSdkDeps) {
    const ver = pkg.dependencies[name];
    const isLinked = ver.startsWith("link:");
    const original = state?.originalVersions?.[name];

    if (isLinked) {
      linked.push({ name, ver, original });
    } else {
      npm.push({ name, ver });
    }
  }

  if (linked.length > 0) {
    console.log("🔗 Linked (local react-sdk):");
    for (const { name, ver, original } of linked) {
      const origStr = original ? ` (npm: ${original})` : "";
      console.log(`   ${name.replace(SCOPE, "").padEnd(25)} ${ver}${origStr}`);
    }
    console.log();
  }

  if (npm.length > 0) {
    console.log("📦 npm registry:");
    for (const { name, ver } of npm) {
      console.log(`   ${name.replace(SCOPE, "").padEnd(25)} ${ver}`);
    }
  }

  console.log(`\nTotal: ${linked.length} linked, ${npm.length} npm`);
}

// ── Main ──

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "link":
    cmdLink(args);
    break;
  case "unlink":
    cmdUnlink();
    break;
  case "status":
    cmdStatus();
    break;
  default:
    console.log(`SDK Link Manager — Switch @liberfi.io/* between local source and npm

Commands:
  link [--all | pkg...]   Link packages to local react-sdk source
  unlink                  Restore all packages to npm versions
  status                  Show current link state

Examples:
  node scripts/sdk-link.mjs link ui-perpetuals
  node scripts/sdk-link.mjs link --all
  node scripts/sdk-link.mjs unlink
  node scripts/sdk-link.mjs status`);
}

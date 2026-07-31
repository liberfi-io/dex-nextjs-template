import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(packageRoot, "locale-key-ownership.csv");
const localePath = (locale) => path.join(packageRoot, "locales", locale, "translation.json");
const applicationScopes = new Set([
  "title", "description", "languages", "header", "footer", "auth",
  "network", "nav", "toolbar", "settings", "common", "search",
]);

function leaves(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" && !Array.isArray(child)
      ? leaves(child, next)
      : [next];
  });
}

function parseCsv(source) {
  const [header, ...rows] = source.trim().split(/\r?\n/);
  const expected = "key,en_present,zh_present,consumer_scope,owner,sdk_key,compatibility_until";
  if (header !== expected) throw new Error(`Invalid ownership columns: ${header}`);
  return rows.map((line) => {
    const values = line.split(",");
    if (values.length !== 7) throw new Error(`Invalid ownership row: ${line}`);
    return Object.fromEntries(header.split(",").map((key, index) => [key, values[index]]));
  });
}

async function resources() {
  return Promise.all(["en", "zh"].map(async (locale) => JSON.parse(await readFile(localePath(locale), "utf8"))));
}

function generatedRows(en, zh) {
  const enKeys = new Set(leaves(en));
  const zhKeys = new Set(leaves(zh));
  return [...new Set([...enKeys, ...zhKeys])].sort().map((key) => {
    const scope = key.split(".")[1];
    const application = applicationScopes.has(scope);
    return {
      key,
      en_present: String(enKeys.has(key)),
      zh_present: String(zhKeys.has(key)),
      consumer_scope: application ? "apps-web" : "sdk-domain-and-legacy-template",
      owner: application ? "application" : "legacy-compat",
      sdk_key: application ? "" : key.replace(/^extend\./, ""),
      compatibility_until: application ? "" : "stage-6",
    };
  });
}

export async function verifyOwnership({ write = false } = {}) {
  const [en, zh] = await resources();
  const expectedRows = generatedRows(en, zh);
  if (write) {
    const header = "key,en_present,zh_present,consumer_scope,owner,sdk_key,compatibility_until";
    const body = expectedRows.map((row) => Object.values(row).join(",")).join("\n");
    await writeFile(csvPath, `${header}\n${body}\n`);
  }
  const rows = parseCsv(await readFile(csvPath, "utf8"));
  const byKey = new Map();
  for (const row of rows) {
    if (byKey.has(row.key)) throw new Error(`Duplicate ownership key: ${row.key}`);
    if (!new Set(["sdk-domain", "application", "legacy-compat"]).has(row.owner)) throw new Error(`Unknown owner for ${row.key}`);
    if (row.owner !== "application" && !row.sdk_key) throw new Error(`Missing sdk_key for ${row.key}`);
    byKey.set(row.key, row);
  }
  for (const expected of expectedRows) {
    const row = byKey.get(expected.key);
    if (!row) throw new Error(`Missing ownership key: ${expected.key}`);
    if (row.en_present !== "true" || row.zh_present !== "true") throw new Error(`Locale parity failure: ${expected.key}`);
  }
  if (byKey.size !== expectedRows.length) throw new Error("Ownership manifest contains stale keys");
  return rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await verifyOwnership({ write: process.argv.includes("--write") });
}

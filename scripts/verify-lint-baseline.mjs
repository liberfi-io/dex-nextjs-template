import { execFile } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const root = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = join(root, "quality/lint-warning-baseline.json");
const exceptionsPath = join(root, "quality/lint-warning-exceptions.json");
const execFileAsync = promisify(execFile);

function repositoryPath(filePath) {
  return relative(root, filePath).replaceAll("\\", "/");
}

function workspaces() {
  return ["apps", "packages"].flatMap((directory) =>
    readdirSync(join(root, directory), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(root, directory, entry.name))
      .filter((workspace) => existsSync(join(workspace, "eslint.config.mjs"))),
  );
}

export function findWarningRegressions(baseline, current) {
  return Object.entries(current)
    .filter(([key, count]) => count > (baseline[key] ?? 0))
    .map(
      ([key, count]) =>
        `${key}: ${count} warning(s), baseline ${baseline[key] ?? 0}`,
    );
}

export function findFinalMismatches(current, exceptions) {
  const expected = exceptions ?? {};
  const keys = new Set([...Object.keys(current), ...Object.keys(expected)]);
  return [...keys]
    .sort()
    .filter((key) => (current[key] ?? 0) !== (expected[key] ?? 0))
    .map(
      (key) =>
        `${key}: current ${current[key] ?? 0}, exception ${expected[key] ?? 0}`,
    );
}

export function parseLintBaselineArgs(argv) {
  const flags = argv.filter((value) => value.startsWith("--"));
  if (flags.includes("--final") && flags.includes("--update")) {
    return { error: "cannot combine --final with --update" };
  }
  return {
    error: null,
    final: flags.includes("--final"),
    printCurrent: flags.includes("--print-current"),
  };
}

export function readApprovedExceptions(filePath = exceptionsPath) {
  if (!existsSync(filePath)) return {};
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  return parsed.warnings ?? parsed;
}

export async function collectLintSummary() {
  const warnings = {};
  const errors = [];

  const reportsByWorkspace = await Promise.all(
    workspaces().map(async (workspace) => {
      try {
        const result = await execFileAsync(
          "pnpm",
          ["exec", "eslint", "src", "--format", "json"],
          {
            cwd: workspace,
            encoding: "utf8",
            env: process.env,
            maxBuffer: 50 * 1024 * 1024,
          },
        );
        return JSON.parse(result.stdout || "[]");
      } catch (error) {
        if (typeof error.stdout === "string") {
          if (error.stdout.trim() === "") {
            throw error;
          }
          return JSON.parse(error.stdout || "[]");
        }
        throw error;
      }
    }),
  );

  for (const reports of reportsByWorkspace) {
    for (const report of reports) {
      for (const message of report.messages) {
        const key = `${repositoryPath(report.filePath)}\t${message.ruleId ?? "unknown"}`;
        if (message.severity === 2) {
          errors.push(
            `${repositoryPath(report.filePath)}:${message.line}:${message.column} ${message.ruleId ?? "unknown"}`,
          );
        } else if (message.severity === 1) {
          warnings[key] = (warnings[key] ?? 0) + 1;
        }
      }
    }
  }

  return {
    warnings: Object.fromEntries(
      Object.entries(warnings).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
    errors,
  };
}

async function main() {
  const args = parseLintBaselineArgs(process.argv.slice(2));
  if (args.error) {
    console.error(args.error);
    process.exitCode = 1;
    return;
  }

  const summary = await collectLintSummary();

  if (args.printCurrent) {
    process.stdout.write(`${JSON.stringify(summary.warnings, null, 2)}\n`);
    return;
  }
  if (summary.errors.length > 0) {
    console.error(`Lint errors:\n${summary.errors.join("\n")}`);
    process.exitCode = 1;
    return;
  }
  if (args.final) {
    const mismatches = findFinalMismatches(
      summary.warnings,
      readApprovedExceptions(),
    );
    if (mismatches.length > 0) {
      console.error(`Lint warning final gate failed:\n${mismatches.join("\n")}`);
      process.exitCode = 1;
      return;
    }
    const count = Object.values(summary.warnings).reduce(
      (total, value) => total + value,
      0,
    );
    console.log(`Lint warning final gate passed (${count} warning(s)).`);
    return;
  }

  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const regressions = findWarningRegressions(baseline.warnings, summary.warnings);
  if (regressions.length > 0) {
    console.error(`Lint warning regressions:\n${regressions.join("\n")}`);
    process.exitCode = 1;
    return;
  }

  const count = Object.values(summary.warnings).reduce(
    (total, value) => total + value,
    0,
  );
  console.log(`Lint warning baseline accepted (${count} warning(s)).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}

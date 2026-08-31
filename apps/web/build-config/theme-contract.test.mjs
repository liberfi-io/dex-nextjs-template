import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const globalsCss = readFileSync(new URL("../src/styles/globals.css", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../src/app/(new)/layout.tsx", import.meta.url), "utf8");

const collectSources = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) return collectSources(path);
    return /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.includes(".test.") ? [path] : [];
  });

test("the consumer exposes the SDK semantic theme contract", () => {
  const requiredMappings = {
    "--color-brand-primary": "hsl(var(--heroui-primary))",
    "--color-brand-secondary": "hsl(var(--heroui-secondary))",
    "--color-text-primary": "hsl(var(--heroui-foreground))",
    "--color-text-secondary": "hsl(var(--heroui-default-700))",
    "--color-text-muted": "hsl(var(--heroui-default-600))",
    "--color-text-disabled": "hsl(var(--heroui-default-500))",
    "--color-text-inverse": "hsl(var(--heroui-primary-foreground))",
    "--color-surface-base": "hsl(var(--heroui-background))",
    "--color-surface-raised": "hsl(var(--heroui-content1))",
    "--color-surface-interactive": "hsl(var(--heroui-content2))",
    "--color-surface-strong": "hsl(var(--heroui-content3))",
    "--color-surface-emphasis": "hsl(var(--heroui-content4))",
    "--color-surface-scrim": "hsl(var(--heroui-overlay) / 0.6)",
    "--color-border-subtle": "hsl(var(--heroui-default-300))",
    "--color-border-control": "hsl(var(--heroui-default-500))",
    "--color-action-primary": "hsl(var(--heroui-primary))",
    "--color-positive": "#22c55e",
    "--color-negative": "#ff4d6d",
    "--color-status-success": "hsl(var(--heroui-success))",
    "--color-status-warning": "hsl(var(--heroui-warning))",
    "--color-status-danger": "hsl(var(--heroui-danger))",
  };

  for (const [token, value] of Object.entries(requiredMappings)) {
    assert.ok(globalsCss.includes(`${token}: ${value};`), `${token} must map to ${value}`);
  }
});

test("the consumer activates the dark theme at the document root", () => {
  assert.match(rootLayout, /className="dark"/);
  assert.match(rootLayout, /colorScheme:\s*"dark"/);
});

test("agent widget colors inherit the shared semantic roles", () => {
  assert.match(globalsCss, /--aw-bg-primary:\s*var\(--color-surface-base\)/);
  assert.match(globalsCss, /--aw-text-primary:\s*var\(--color-text-primary\)/);
  assert.match(globalsCss, /--aw-accent:\s*var\(--color-brand-primary\)/);
});

test("application components avoid low-contrast and disconnected palette utilities", () => {
  const violations = collectSources(new URL("../src/", import.meta.url)).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    const matches = source.match(
      /text-(?:zinc|neutral|slate|gray|stone)-\d+|text-default-[3-6]00|(?:text|bg|border)-(?:bullish|bearish)/g,
    );
    return matches ? [`${file.pathname}: ${[...new Set(matches)].join(", ")}`] : [];
  });

  assert.deepEqual(violations, []);
});

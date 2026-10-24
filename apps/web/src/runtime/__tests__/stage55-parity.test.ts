import fs from "node:fs";
import path from "node:path";

const WEB_SRC = path.resolve(__dirname, "../..");
const TEMPLATE_ROOT = path.resolve(WEB_SRC, "../../..");

const RETAINED = [
  "@liberfi/react-launchpad",
  "@liberfi/ui-launchpad",
  "@liberfi/react-redpacket",
  "@liberfi/ui-redpacket",
] as const;

const WORKSPACE_PACKAGES = [
  "packages/react-launchpad/package.json",
  "packages/ui-launchpad/package.json",
  "packages/react-redpacket/package.json",
  "packages/ui-redpacket/package.json",
] as const;

function collectImports(specifier: string): string[] {
  const matches: string[] = [];
  const visit = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
      const source = fs.readFileSync(full, "utf8");
      if (source.includes(`from "${specifier}"`) || source.includes(`from '${specifier}'`)) {
        matches.push(path.relative(WEB_SRC, full));
      }
    }
  };
  visit(WEB_SRC);
  return matches.sort();
}

describe("Stage 5.5 launchpad/redpacket parity", () => {
  it("loads Stage55 react packages only through Stage55 adapters", () => {
    expect(collectImports("@liberfi.io/react-launchpad")).toEqual([
      "runtime/__tests__/stage55-adapters.test.ts",
      "runtime/createStage55Adapters.ts",
    ]);
    expect(collectImports("@liberfi.io/react-redpacket")).toEqual([
      "runtime/createStage55Adapters.ts",
    ]);
  });

  it("switches production widgets onto published SDK UI", () => {
    expect(collectImports("@liberfi.io/ui-launchpad")).toEqual(
      expect.arrayContaining([
        "components/modals/LaunchPadModal.tsx",
        "runtime/Stage55UiBridge.tsx",
      ]),
    );
    expect(collectImports("@liberfi.io/ui-redpacket")).toEqual(
      expect.arrayContaining([
        "components/page/RedPacketHomePage.tsx",
        "components/page/RedPacketLayout.tsx",
        "runtime/Stage55UiBridge.tsx",
      ]),
    );
  });

  it("clears retained template UI imports from apps/web", () => {
    const counts = Object.fromEntries(
      RETAINED.map((specifier) => [specifier, collectImports(specifier).length]),
    );
    expect(counts["@liberfi/react-launchpad"]).toBe(0);
    expect(counts["@liberfi/ui-launchpad"]).toBe(0);
    expect(counts["@liberfi/react-redpacket"]).toBe(0);
    expect(counts["@liberfi/ui-redpacket"]).toBe(0);
  });

  it("removes the four leftover launchpad/redpacket workspace packages", () => {
    for (const relativePath of WORKSPACE_PACKAGES) {
      expect(fs.existsSync(path.join(TEMPLATE_ROOT, relativePath))).toBe(false);
    }
  });
});

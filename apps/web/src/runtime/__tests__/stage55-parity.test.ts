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

const UNPUBLISHED = [
  "@liberfi.io/react-launchpad",
  "@liberfi.io/ui-launchpad",
  "@liberfi.io/react-redpacket",
  "@liberfi.io/ui-redpacket",
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
  it("keeps unpublished SDK packages off production source", () => {
    for (const specifier of UNPUBLISHED) {
      expect(collectImports(specifier)).toEqual([]);
    }
  });

  it("keeps retained template packages imported (Stage 6 delete blocked)", () => {
    const counts = Object.fromEntries(
      RETAINED.map((specifier) => [specifier, collectImports(specifier).length]),
    );
    expect(counts["@liberfi/react-launchpad"]).toBeGreaterThan(0);
    expect(counts["@liberfi/ui-launchpad"]).toBeGreaterThan(0);
    expect(counts["@liberfi/react-redpacket"]).toBeGreaterThan(0);
    expect(counts["@liberfi/ui-redpacket"]).toBeGreaterThan(0);
  });

  it("does not remove the four workspace packages", () => {
    for (const relativePath of WORKSPACE_PACKAGES) {
      expect(fs.existsSync(path.join(TEMPLATE_ROOT, relativePath))).toBe(true);
    }
  });

  it("keeps new redpacket routes on retained widgets", () => {
    expect(collectImports("@liberfi/ui-redpacket")).toEqual(
      expect.arrayContaining([
        "app/(legacy)/legacy/redpacket/page.tsx",
        "components/page/RedPacketHomePage.tsx",
        "components/page/RedPacketLayout.tsx",
      ]),
    );
    expect(collectImports("@liberfi/ui-launchpad")).toEqual(
      expect.arrayContaining([
        "components/Modals.tsx",
        "components/modals/LaunchPadModal.tsx",
      ]),
    );
  });
});

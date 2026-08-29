import fs from "node:fs";
import path from "node:path";

const WEB_SRC = path.resolve(__dirname, "../..");
const TEMPLATE_ROOT = path.resolve(WEB_SRC, "../../..");

const LEFTOVER_PACKAGES = [
  "core",
  "locales",
  "react-backend",
  "react-dex",
  "react-launchpad",
  "react-redpacket",
  "ui-base",
  "ui-dex",
  "ui-launchpad",
  "ui-redpacket",
] as const;

describe("S6-06 leftover package deletion", () => {
  it("deletes every leftover workspace package directory", () => {
    for (const name of LEFTOVER_PACKAGES) {
      expect(fs.existsSync(path.join(TEMPLATE_ROOT, "packages", name, "package.json"))).toBe(
        false,
      );
    }
  });

  it("drops leftover workspace dependencies from apps/web", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(TEMPLATE_ROOT, "apps/web/package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    for (const name of LEFTOVER_PACKAGES) {
      expect(manifest.dependencies[`@liberfi/${name}`]).toBeUndefined();
    }
  });

  it("declares published launchpad, redpacket, and tradingview SDK packages", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(TEMPLATE_ROOT, "apps/web/package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    expect(manifest.dependencies["@liberfi.io/react-launchpad"]).toMatch(/^\^0\.1\./);
    expect(manifest.dependencies["@liberfi.io/react-redpacket"]).toMatch(/^\^0\.1\./);
    expect(manifest.dependencies["@liberfi.io/ui-launchpad"]).toMatch(/^\^1\.0\./);
    expect(manifest.dependencies["@liberfi.io/ui-redpacket"]).toMatch(/^\^1\.0\./);
    expect(manifest.dependencies["@liberfi.io/ui-tradingview"]).toMatch(/^\^0\.1\./);
  });
});

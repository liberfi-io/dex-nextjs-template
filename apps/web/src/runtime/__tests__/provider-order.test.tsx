import fs from "node:fs";
import path from "node:path";
import {
  APP_RUNTIME_PROVIDER_ORDER,
  PERPETUALS_RUNTIME_PROVIDER_ORDER,
  PREDICT_RUNTIME_PROVIDER_ORDER,
  validateRuntimeProviderOrder,
} from "../runtime-lifecycle-policy";

describe("application provider order policy", () => {
  it("keeps the frozen application provider order", () => {
    expect(APP_RUNTIME_PROVIDER_ORDER).toEqual([
      "modal-coordinator",
      "query-client",
      "auth",
      "locale",
      "app-runtime",
      "pinata",
      "application-adapters",
      "api-client",
      "media-track",
      "channels",
      "portfolio-account",
      "application-shell",
    ]);
    expect(validateRuntimeProviderOrder(APP_RUNTIME_PROVIDER_ORDER)).toBe(true);
  });

  it("keeps route-only providers outside the shared homepage runtime", () => {
    expect(PREDICT_RUNTIME_PROVIDER_ORDER).toEqual([
      "predict",
      "polymarket",
      "application-shell",
    ]);
    expect(PERPETUALS_RUNTIME_PROVIDER_ORDER).toEqual([
      "perpetuals",
      "application-shell",
    ]);

    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/runtime/AppRuntimeProviders.tsx"),
      "utf8",
    );
    expect(source).not.toContain("Stage54AdaptersProvider");
    expect(source).not.toContain("PolymarketProvider");
    expect(source).not.toContain("PerpetualsProvider");
    expect(source).not.toContain("PortfolioClientProvider");
  });

  it("rejects a permuted provider order", () => {
    const invalidOrder = [...APP_RUNTIME_PROVIDER_ORDER];
    const pinataIndex = invalidOrder.indexOf("pinata");
    const apiIndex = invalidOrder.indexOf("api-client");
    [invalidOrder[pinataIndex], invalidOrder[apiIndex]] = [
      invalidOrder[apiIndex],
      invalidOrder[pinataIndex],
    ];

    expect(validateRuntimeProviderOrder(invalidOrder)).toBe(false);
  });

  it("drops DexData after SOL quote moves onto the SDK token query", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/runtime/AppRuntimeProviders.tsx"),
      "utf8",
    );
    expect(source).not.toContain("DexDataRuntimeProvider");
    expect(source).not.toContain("DexDataProvider");
    expect(source).not.toContain("@liberfi/ui-dex");
    expect(source).toContain('from "../application/pinata"');
    expect(source).not.toContain("@liberfi/react-dex");
  });

  it("removes the leftover legacy AppLayout after option-A redirects", () => {
    expect(fs.existsSync(path.resolve(process.cwd(), "src/components/AppLayout.tsx"))).toBe(
      false,
    );
    expect(fs.existsSync(path.resolve(process.cwd(), "src/app/(legacy)"))).toBe(false);
  });
});

import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), "src", relativePath), "utf8");
}

describe("route-owned runtime boundaries", () => {
  it("keeps Predict and perpetuals clients out of the shared client hook", () => {
    const sharedHook = readSource("runtime/useAppClientBundle.ts");
    expect(sharedHook).not.toContain("createPredictClients");
    expect(sharedHook).not.toContain("createPerpetualsClients");
    expect(sharedHook).not.toContain("createPortfolioClient");
  });

  it("installs the complete Predict runtime only inside its route chunk", () => {
    const source = readSource("runtime/PredictRuntimeProviders.tsx");
    expect(source).toContain("createPredictClients");
    expect(source).toContain("<Stage54AdaptersProvider");
    expect(source).toContain("<PolymarketProvider>");
    expect(source).toContain("<PredictWalletProvider enabled>");
    expect(source).toContain("<DeferredAsyncModalHost>");
  });

  it("installs the complete perpetuals runtime only inside its route chunk", () => {
    const source = readSource("runtime/PerpetualsRuntimeProviders.tsx");
    expect(source).toContain("createPerpetualsClients");
    expect(source).toContain("<PerpetualsProvider");
    expect(source).toContain("<HyperliquidAccountStateSync />");
    expect(source).toContain("<DeferredAsyncModalHost>");
  });

  it("loads route runtimes through dynamic boundaries in the application shell", () => {
    const source = readSource("components/NewAppLayout.tsx");
    expect(source).toContain('import("../runtime/PredictRuntimeProviders")');
    expect(source).toContain('import("../runtime/PerpetualsRuntimeProviders")');
    expect(source).not.toContain('import { PredictWalletProvider } from "@liberfi.io/ui-predict"');
    expect(source).toContain("<DeferredAsyncModalHost>");
    expect(source).not.toContain('from "./modals/LaunchPadModal"');
    expect(source).not.toContain('from "./modals/ReceiveModal"');
    expect(source).not.toContain('from "./modals/WithdrawModal"');
  });

  it("keeps heavy modal modules behind first-open import functions", () => {
    const source = readSource("components/modals/modal-loaders.ts");
    expect(source).toContain('import("./LaunchPadModal")');
    expect(source).toContain('import("./DepositHyperliquidUsdcModal")');
    expect(source).toContain('import("../FundWalletModal")');
    expect(source).toContain('import("@liberfi.io/ui-predict")');
    expect(source).toContain('import("@liberfi.io/ui-trade")');
  });

  it("keeps Pinata out of the shared runtime until an upload starts", () => {
    const runtime = readSource("runtime/AppRuntimeProviders.tsx");
    const uploadAdapter = readSource("application/pinata.tsx");

    expect(runtime).not.toContain("PinataProvider");
    expect(runtime).not.toContain('from "../libs/pinata"');
    expect(uploadAdapter).toContain('import("pinata")');
  });
});

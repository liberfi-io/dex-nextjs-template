import fs from "node:fs";
import path from "node:path";
import { Chain } from "@liberfi.io/types";
import { authenticatePrivy } from "../auth/authenticatePrivy";
import { CONFIG } from "../config";
import {
  APPLICATION_LOCALE_ROOTS,
  SDK_DOMAIN_LOCALE_ROOTS,
} from "../locales/roots";
import en from "../locales/en.json";
import zh from "../locales/zh.json";
import { MemoryStorage } from "../storage";
import { MockAppSdk } from "../app-sdk";
import { buildCreateOnrampWidgetUrlBody } from "../server/useCreateOnrampWidgetUrlMutation";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenAvatar,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "../tokens";

const WEB_SRC = path.resolve(__dirname, "../..");
const TEMPLATE_ROOT = path.resolve(WEB_SRC, "../../..");

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
      const quoted = new RegExp(`from ['"]${specifier}(?:/[^'"]*)?['"]`);
      if (quoted.test(source)) {
        matches.push(path.relative(WEB_SRC, full));
      }
    }
  };
  visit(WEB_SRC);
  return matches.sort();
}

describe("S6-02 application adapters", () => {
  it("owns branding config without @liberfi/core", () => {
    expect(CONFIG.branding.name).toBe("Liberfi");
    expect(CONFIG.branding.logo).toBe("/brand.png");
  });

  it("owns storage and app sdk without @liberfi/core types", async () => {
    const storage = new MemoryStorage();
    await storage.set("theme", "dark");
    expect(await storage.get("theme")).toBe("dark");
    const sdk = new MockAppSdk();
    expect(sdk.storage).toBeInstanceOf(MemoryStorage);
  });

  it("exchanges Privy tokens through the Next auth route", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({ accessToken: "app-jwt" }),
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const result = await authenticatePrivy({
        accessToken: "privy-access",
        identityToken: "privy-identity",
      });

      expect(fetchMock).toHaveBeenCalledWith("/api/auth/privy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: "privy-access",
          identityToken: "privy-identity",
        }),
      });
      expect(result).toEqual({ success: true, token: "app-jwt" });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("maps onramp widget params without the backend package", () => {
    expect(
      buildCreateOnrampWidgetUrlBody({
        chain: Chain.SOLANA,
        walletAddress: "wallet",
        cryptoCurrency: "SOL",
        fiatCurrency: "USD",
        fiatAmount: 25,
      }),
    ).toEqual({
      provider: undefined,
      widgetParams: {
        walletAddress: "wallet",
        network: "solana",
        defaultCryptoCurrency: "SOL",
        fiatCurrency: "USD",
        defaultFiatAmount: 25,
      },
    });
  });

  it("keeps application locale files free of SDK-owned domain copy", () => {
    for (const resource of [en, zh]) {
      expect(Object.keys(resource.extend).sort()).toEqual([...APPLICATION_LOCALE_ROOTS].sort());
      for (const root of SDK_DOMAIN_LOCALE_ROOTS) {
        expect(resource.extend).not.toHaveProperty(root);
      }
    }
  });

  it("keeps @liberfi/locales out of application locale files and UI", () => {
    expect(collectImports("@liberfi/locales")).toEqual([
      "application/locales/legacy-domain-resources.ts",
    ]);
  });

  it("owns primary-token helpers without @liberfi/core", () => {
    expect(getPrimaryTokenSymbol(Chain.SOLANA)).toBe("SOL");
    expect(getPrimaryTokenAddress(Chain.SOLANA)).toBe("11111111111111111111111111111111");
    expect(getPrimaryTokenDecimals(Chain.SOLANA)).toBe(9);
    expect(getPrimaryTokenAvatar(Chain.SOLANA)).toBe("/images/tokens/sol.svg");
  });

  it("stops apps/web from importing config/storage/auth/onramp from workspace packages", () => {
    expect(collectImports("@liberfi/core")).toEqual([]);
    expect(collectImports("@liberfi/react-dex")).toEqual([]);
    expect(collectImports("@liberfi/react-backend")).toEqual([
      "application/server/graphql.ts",
      "components/modals/WithdrawModal.tsx",
    ]);
  });

  it("does not delete the workspace packages", () => {
    for (const relativePath of [
      "packages/core/package.json",
      "packages/locales/package.json",
      "packages/react-backend/package.json",
    ]) {
      expect(fs.existsSync(path.join(TEMPLATE_ROOT, relativePath))).toBe(true);
    }
  });
});

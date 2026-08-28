import fs from "node:fs";
import path from "node:path";
import { Chain } from "@liberfi.io/types";
import { formatShortAddress } from "../format";
import { AppRoute, tokenDetailChainSegment, tokenDetailRoute } from "../routes";
import { isValidWalletAddress } from "../wallet";

const WEB_SRC = path.resolve(__dirname, "../..");

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

describe("S6-03 token/trade app adapters", () => {
  it("builds token detail routes without @liberfi/ui-dex", () => {
    expect(tokenDetailRoute(Chain.SOLANA, "mint")).toBe("/tokens/sol/mint");
    expect(tokenDetailRoute("ethereum", "0xabc")).toBe("/tokens/eth/0xabc");
    expect(tokenDetailChainSegment("bnb")).toBe("bsc");
    expect(AppRoute.trade).toBe("/tokens");
  });

  it("validates Solana addresses and rejects invalid input", () => {
    expect(
      isValidWalletAddress(Chain.SOLANA, "11111111111111111111111111111111"),
    ).toBe(true);
    expect(isValidWalletAddress(Chain.SOLANA, "not-an-address")).toBe(false);
    expect(isValidWalletAddress(Chain.ETHEREUM, "0xabc")).toBe(false);
  });

  it("shortens addresses without the ui-dex format helper", () => {
    expect(formatShortAddress("abcdef")).toBe("abcdef");
    expect(formatShortAddress("abcdefghijklmnop")).toBe("abcdef...mnop");
  });

  it("stops production pages from importing ui-dex routes and format helpers", () => {
    expect(collectImports("@liberfi/ui-dex/libs/routes")).toEqual([]);
    expect(collectImports("@liberfi/ui-dex")).not.toEqual(
      expect.arrayContaining([
        "components/NewAppLayout.tsx",
        "components/home/HomePage.tsx",
        "components/home/CombinedTokenList.tsx",
        "components/pulse/PulsePage.tsx",
        "components/page/portfolio/bottom-tables/PortfolioAssetsTable.tsx",
        "components/page/token-detail/bottom-tables/BottomDevTokensTable.tsx",
        "components/page/token-detail/TokenDetailHeader.tsx",
        "components/page/token-detail/TokenDetailHeaderMobile.tsx",
        "hooks/useRouterAdapter.tsx",
        "hooks/useTranslationAdapter.tsx",
        "components/modals/WithdrawModal.tsx",
      ]),
    );
  });

  it("routes home instant buy through the SDK swap hook", () => {
    const instantBuy = fs.readFileSync(
      path.join(WEB_SRC, "components/home/InstantBuy2.tsx"),
      "utf8",
    );
    const legacyBuy = fs.readFileSync(
      path.join(WEB_SRC, "components/home/InstsantBuy.tsx"),
      "utf8",
    );
    expect(instantBuy).toContain('from "@liberfi.io/ui-trade"');
    expect(instantBuy).not.toContain("useSwap } from \"@liberfi/ui-dex\"");
    expect(legacyBuy).toContain('from "@liberfi.io/ui-trade"');
    expect(legacyBuy).not.toContain("useSwap } from \"@liberfi/ui-dex\"");
  });
});

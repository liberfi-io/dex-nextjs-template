import { Chain } from "@liberfi.io/types";
import { defaultTokenDetailRoute, resolveTokenRouteSlug } from "./routes";

const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

describe("BSC token entry routes", () => {
  it.each([undefined, "solana", "ethereum", "unknown"])(
    "falls back to WBNB for default chain %s",
    (chain) => {
      expect(defaultTokenDetailRoute(chain, "old-solana-address"))
        .toBe(`/tokens/bsc/${wbnb}`);
    },
  );

  it("preserves a configured BSC token", () => {
    expect(defaultTokenDetailRoute("bsc", wbnb)).toBe(`/tokens/bsc/${wbnb}`);
    expect(resolveTokenRouteSlug(["bsc", wbnb]))
      .toEqual({ chainId: Chain.BINANCE, address: wbnb });
  });

  it.each(["sol", "eth", "polygon"])("rejects unsupported detail chain %s", (chain) => {
    expect(resolveTokenRouteSlug([chain, wbnb])).toBeNull();
  });
});

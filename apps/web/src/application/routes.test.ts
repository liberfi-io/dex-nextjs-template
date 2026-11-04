import { Chain } from "@liberfi.io/types";
import { defaultTokenDetailRoute, resolveTokenRouteSlug, tokenDetailRoute } from "./routes";

const address = "0x1111111111111111111111111111111111111111";
describe("Robinhood mainnet entry routes", () => {
  it.each([undefined, "bsc", "solana", "ethereum", "unknown"])("returns home for legacy default chain %s", (chain) => {
    expect(defaultTokenDetailRoute(chain, address)).toBe("/?chain=robinhood");
  });
  it("keeps an explicitly configured mainnet token", () => {
    expect(defaultTokenDetailRoute("robinhood", address)).toBe(`/tokens/robinhood/${address}`);
    expect(tokenDetailRoute(Chain.ROBINHOOD, address)).toBe(`/tokens/robinhood/${address}`);
    expect(resolveTokenRouteSlug(["robinhood", address])).toEqual({ chainId: Chain.ROBINHOOD, address });
  });
  it.each([undefined, "invalid", ""])("does not invent a default token for %s", (value) => {
    expect(defaultTokenDetailRoute("robinhood", value)).toBe("/?chain=robinhood");
  });
  it.each(["bsc", "sol", "eth", "polygon"])("rejects unsupported chain %s", (chain) => {
    expect(resolveTokenRouteSlug([chain, address])).toBeNull();
  });
});

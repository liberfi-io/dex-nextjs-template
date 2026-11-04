import { Chain } from "@liberfi.io/types";
import { robinhoodMainnet } from "./robinhood-chain";
import { getPrimaryTokenSymbol, getPrimaryTokenDecimals, getPrimaryTokenAddress } from "./tokens";
import { buildSecurityProviderLinks } from "../components/page/token-detail/securityLinks";

it("uses Robinhood mainnet and ETH units", () => {
  expect(robinhoodMainnet.id).toBe(Number(Chain.ROBINHOOD));
  expect(robinhoodMainnet.id).toBe(4663);
  expect(robinhoodMainnet.rpcUrls.default.http).toEqual(["https://rpc.mainnet.chain.robinhood.com/"]);
  expect(getPrimaryTokenSymbol(Chain.ROBINHOOD)).toBe("ETH");
  expect(getPrimaryTokenDecimals(Chain.ROBINHOOD)).toBe(18);
  expect(getPrimaryTokenAddress(Chain.ROBINHOOD)).toBe("0x0000000000000000000000000000000000000000");
  expect(buildSecurityProviderLinks(Chain.ROBINHOOD, "0xabc")).toEqual([]);
});

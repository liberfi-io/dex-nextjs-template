import { render } from "@testing-library/react";
import { Chain } from "@liberfi.io/types";
import fs from "node:fs";
import path from "node:path";
import {
  PRIMARY_TOKEN_PRICE_POLL_INTERVAL_MS,
  PrimaryTokenPricePoller,
} from "./PrimaryTokenPricePoller";

const mockUseTokenQuery = jest.fn();
let currentChain = Chain.SOLANA;

jest.mock("@liberfi.io/react", () => ({
  useTokenQuery: (...args: unknown[]) => mockUseTokenQuery(...args),
}));
jest.mock("@liberfi.io/ui-chain-select", () => ({
  useCurrentChain: () => ({ chain: currentChain }),
}));

describe("PrimaryTokenPricePoller", () => {
  beforeEach(() => {
    mockUseTokenQuery.mockReset();
    mockUseTokenQuery.mockReturnValue({ data: undefined });
    currentChain = Chain.SOLANA;
  });

  it("polls only the wrapped native token for the current chain", () => {
    const { rerender } = render(<PrimaryTokenPricePoller />);

    expect(mockUseTokenQuery).toHaveBeenCalledTimes(1);
    expect(mockUseTokenQuery).toHaveBeenCalledWith(
      {
        chain: Chain.SOLANA,
        address: "So11111111111111111111111111111111111111112",
      },
      expect.objectContaining({
        enabled: true,
        refetchInterval: PRIMARY_TOKEN_PRICE_POLL_INTERVAL_MS,
      }),
    );

    mockUseTokenQuery.mockClear();
    currentChain = Chain.ETHEREUM;
    rerender(<PrimaryTokenPricePoller />);

    expect(mockUseTokenQuery).toHaveBeenCalledTimes(1);
    expect(mockUseTokenQuery).toHaveBeenCalledWith(
      {
        chain: Chain.ETHEREUM,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
      expect.objectContaining({
        enabled: true,
        refetchInterval: PRIMARY_TOKEN_PRICE_POLL_INTERVAL_MS,
      }),
    );
  });

  it("mounts the poller inside the runtime capability provider", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../runtime/AppRuntimeProviders.tsx"),
      "utf8",
    );

    expect(source).toContain("<PrimaryTokenPricePoller />");
  });
});

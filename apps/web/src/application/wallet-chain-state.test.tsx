import { renderHook } from "@testing-library/react";
import { Chain } from "@liberfi.io/types";
import fs from "node:fs";
import path from "node:path";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";
import { useWalletPrimaryTokenNetWorth } from "./useWalletPrimaryTokenNetWorth";

const WEB_SRC = path.resolve(__dirname, "..");

const mockUseCurrentChain = jest.fn();
const mockUseConnectedWallet = jest.fn();
const mockUseWalletPortfoliosQuery = jest.fn();

jest.mock("@liberfi.io/ui-chain-select", () => ({
  useCurrentChain: () => mockUseCurrentChain(),
}));

jest.mock("@liberfi.io/wallet-connector", () => ({
  useAuth: () => ({
    user: {
      wallets: [
        { chain: Chain.SOLANA, address: "sol-wallet" },
        { chain: Chain.ETHEREUM, address: "0xeth-wallet" },
      ],
    },
  }),
  useConnectedWallet: (chain: Chain) => mockUseConnectedWallet(chain),
}));

jest.mock("@liberfi.io/react", () => ({
  useWalletPortfoliosQuery: (...args: unknown[]) => mockUseWalletPortfoliosQuery(...args),
}));

describe("useCurrentWalletAddress", () => {
  beforeEach(() => {
    mockUseCurrentChain.mockReset();
    mockUseConnectedWallet.mockReset();
    mockUseWalletPortfoliosQuery.mockReset();
  });

  it("switches from the Solana wallet address to the EVM wallet address", () => {
    let chain = Chain.SOLANA;
    mockUseCurrentChain.mockImplementation(() => ({ chain }));
    mockUseConnectedWallet.mockImplementation((requestedChain: Chain) =>
      requestedChain === Chain.SOLANA ? { address: "sol-wallet" } : { address: "0xeth-wallet" },
    );

    const { result, rerender } = renderHook(() => useCurrentWalletAddress());
    expect(result.current).toBe("sol-wallet");

    chain = Chain.ETHEREUM;
    rerender();

    expect(result.current).toBe("0xeth-wallet");
    expect(mockUseConnectedWallet).toHaveBeenLastCalledWith(Chain.ETHEREUM);
  });

  it("uses the wallet summary native balance when the holdings list omits the native token", () => {
    mockUseCurrentChain.mockReturnValue({ chain: Chain.SOLANA });
    mockUseConnectedWallet.mockReturnValue({ address: "sol-wallet" });
    mockUseWalletPortfoliosQuery.mockReturnValue({
      data: {
        chain: Chain.SOLANA,
        address: "sol-wallet",
        balanceInNative: "0.0183",
        balanceInUsd: "1.832",
        portfolios: [],
      },
    });

    const { result } = renderHook(() => useWalletPrimaryTokenNetWorth());

    expect(result.current?.amount).toBe("0.0183");
  });
});

describe("WithdrawModal native balance", () => {
  it("uses the chain-scoped summary balance instead of requiring a native holding row", () => {
    const source = fs.readFileSync(
      path.join(WEB_SRC, "components/modals/WithdrawModal.tsx"),
      "utf8",
    );

    expect(source).toContain("portfolioData?.balanceInNative");
    expect(source).not.toMatch(/portfolios[^;]+find\(/s);
  });
});

import { renderHook } from "@testing-library/react";
import { Chain } from "@liberfi.io/types";
import fs from "node:fs";
import path from "node:path";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";
import {
  formatWalletPrimaryTokenBalance,
  useWalletPrimaryTokenNetWorth,
} from "./useWalletPrimaryTokenNetWorth";

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

  it("does not expose cached balance data after the Chainstream query fails", () => {
    mockUseCurrentChain.mockReturnValue({ chain: Chain.ETHEREUM });
    mockUseConnectedWallet.mockReturnValue({ address: "0xeth-wallet" });
    mockUseWalletPortfoliosQuery.mockReturnValue({
      data: {
        chain: Chain.ETHEREUM,
        address: "0xeth-wallet",
        balanceInNative: "0",
        balanceInUsd: "0",
        portfolios: [],
      },
      isError: true,
      error: new Error("Chainstream returned 500"),
    });

    const { result } = renderHook(() => useWalletPrimaryTokenNetWorth());

    expect(result.current).toBeUndefined();
  });

  it("hides the previous chain balance as soon as the selected chain changes", () => {
    mockUseCurrentChain.mockReturnValue({ chain: Chain.ETHEREUM });
    mockUseConnectedWallet.mockReturnValue({ address: "0xeth-wallet" });
    mockUseWalletPortfoliosQuery.mockReturnValue({
      data: {
        chain: Chain.SOLANA,
        address: "sol-wallet",
        balanceInNative: "1.25",
        balanceInUsd: "125",
        portfolios: [],
      },
      isError: false,
    });

    const { result } = renderHook(() => useWalletPrimaryTokenNetWorth());

    expect(result.current).toBeUndefined();
  });

  it("formats a successful zero balance as zero and an unavailable balance as a placeholder", () => {
    expect(formatWalletPrimaryTokenBalance("0")).toBe("0");
    expect(formatWalletPrimaryTokenBalance(undefined)).toBe("--");
  });
});

describe("WithdrawModal native balance", () => {
  it("uses the chain-scoped summary balance instead of requiring a native holding row", () => {
    const source = fs.readFileSync(
      path.join(WEB_SRC, "components/modals/WithdrawModal.tsx"),
      "utf8",
    );

    expect(source).toContain("formatWalletPrimaryTokenBalance(nativeBalanceAmount)");
    expect(source).not.toMatch(/portfolios[^;]+find\(/s);
  });
});

import { renderHook } from "@testing-library/react";
import { Chain } from "@liberfi.io/types";
import { useChainUrlSync } from "./useChainUrlSync";

const mockReplace = jest.fn();
const mockSelectChain = jest.fn();
let mockQuery = "";
let mockPathname = "/";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockQuery),
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("@liberfi.io/ui-chain-select", () => ({
  useCurrentChain: () => ({ chain: Chain.BINANCE }),
  useSelectChain: () => ({ selectChain: mockSelectChain }),
}));
jest.mock("@liberfi.io/wallet-connector", () => ({
  useSwitchEvmWalletsToChain: () => jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = "/";
  mockQuery = "";
});

it.each(["sol", "eth", "unknown"])("replaces old query chain %s with BSC", (chain) => {
  mockQuery = `chain=${chain}&source=shared`;
  renderHook(() => useChainUrlSync());
  expect(mockReplace).toHaveBeenCalledWith("/?chain=bsc&source=shared");
  expect(mockSelectChain).not.toHaveBeenCalled();
});

it.each(["", "chain=bsc"])("keeps the default BSC selection for %s", (query) => {
  mockQuery = query;
  renderHook(() => useChainUrlSync());
  expect(mockReplace).not.toHaveBeenCalled();
  expect(mockSelectChain).not.toHaveBeenCalled();
});

it("does not reinterpret an old token address as a BSC address", () => {
  mockPathname = "/tokens/sol/old-solana-address";
  mockQuery = "chain=sol";
  renderHook(() => useChainUrlSync());
  expect(mockReplace).toHaveBeenCalledWith("/?chain=bsc");
});

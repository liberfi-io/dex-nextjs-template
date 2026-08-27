/**
 * Read the user's Hyperliquid balances:
 *   - Perp USDC (the cross-margin account value, in USDC).
 *   - Spot USDC and Spot USOL balances.
 *
 * Backed exclusively by the SDK's `webData2` push channel — the cache
 * is filled by `<HyperliquidAccountStateSync />` (mounted once in
 * `NewAppLayout`) and this hook is a pure subscriber. No HTTP polling,
 * no fetch on mount: the WebSocket primes the snapshot on connect and
 * every fill / margin movement updates it incrementally.
 *
 * The hook intentionally keeps the legacy string-shaped API
 * (`perpUsdc`, `spotUsdc`, `spotUsol`) so existing callers
 * (`NewAppLayout`, `DepositHyperliquidUsdcModal`) don't need to change.
 */
"use client";

import { useMemo } from "react";

import { useAccountStateQuery } from "@liberfi.io/ui-perpetuals";

export type HyperliquidBalances = {
  /** Perp account value in USDC, e.g. "12.345" */
  perpUsdc: string;
  /** Spot USDC balance, e.g. "0.0" */
  spotUsdc: string;
  /** Spot USOL balance, e.g. "0.0" */
  spotUsol: string;
  /**
   * Total perp account value, in USDC. Sourced from `Account.totalEquity`
   * which itself parses Hyperliquid's
   * `clearinghouseState.marginSummary.accountValue`. Matches the
   * "合约账户价值 / Account Value" figure shown on the perpetuals form.
   */
  accountValue: number;
  /**
   * Withdrawable margin, in USDC. Sourced from
   * `Account.availableBalance`, i.e. Hyperliquid's `withdrawable` field
   * which already nets out cross-margin reservations. Matches the
   * "可用保证金 / Available Margin" figure shown on the perpetuals form.
   */
  availableMargin: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

const DEFAULT: HyperliquidBalances = {
  perpUsdc: "0",
  spotUsdc: "0",
  spotUsol: "0",
  accountValue: 0,
  availableMargin: 0,
  isLoading: false,
  isError: false,
  refetch: async () => undefined,
};

/**
 * Match the previous query-key shape so consumers that called
 * `queryClient.invalidateQueries({ queryKey: hyperliquidBalancesQueryKey(addr) })`
 * keep working. The SDK's `accountStateQueryKey` is now the source of
 * truth for the underlying data.
 */
export function hyperliquidBalancesQueryKey(address?: string) {
  return ["hyperliquid", "balances", address?.toLowerCase()] as const;
}

export function useHyperliquidBalances(
  hlEvmAddress?: string,
): HyperliquidBalances {
  const enabled = Boolean(hlEvmAddress && hlEvmAddress.startsWith("0x"));

  const { data: account, isLoading } = useAccountStateQuery({
    userAddress: hlEvmAddress,
    enabled,
  });

  return useMemo<HyperliquidBalances>(() => {
    if (!enabled) return DEFAULT;
    if (!account) {
      return {
        ...DEFAULT,
        isLoading,
      };
    }

    const usdc = account.spotBalances.find((b) => b.coin === "USDC");
    const usol = account.spotBalances.find((b) => b.coin === "USOL");

    return {
      // The legacy callers feed these strings into `parseFloat`, so
      // surfacing decimal-preserving strings here keeps display
      // formatting (Account Value with 2 dp) and rounding behaviour
      // unchanged. We use the venue's raw `accountValue` when we have
      // it on the WS push payload; otherwise fall back to the parsed
      // `totalEquity`.
      perpUsdc: pickAccountValue(account),
      spotUsdc: usdc?.totalRaw ?? usdc?.total.toString() ?? "0",
      spotUsol: usol?.totalRaw ?? usol?.total.toString() ?? "0",
      accountValue: account.totalEquity,
      availableMargin: account.availableBalance,
      isLoading,
      isError: false,
      refetch: async () => undefined,
    };
  }, [enabled, account, isLoading]);
}

/**
 * Hyperliquid's `clearinghouseState.marginSummary.accountValue` arrives
 * as a string with venue-precise decimals (e.g. `"6.668992"`). The SDK
 * parses it into a number for `totalEquity`; if the raw payload is
 * still attached (it usually is, on `webData2` pushes) we round-trip to
 * the original string to avoid `Number → toString` rounding drift.
 */
function pickAccountValue(account: {
  totalEquity: number;
  raw?: unknown;
}): string {
  const payload =
    account.raw && typeof account.raw === "object"
      ? (account.raw as {
          clearinghouseState?: { marginSummary?: { accountValue?: unknown } };
        })
      : undefined;
  const raw = payload?.clearinghouseState?.marginSummary?.accountValue;
  if (typeof raw === "string" && raw.length > 0) return raw;
  return account.totalEquity.toString();
}

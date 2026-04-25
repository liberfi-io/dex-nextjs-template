/**
 * Fetch the user's Hyperliquid balances:
 *   - Perp USDC (the cross-margin account value, in USDC).
 *   - Spot USDC and Spot USOL balances.
 *
 * Both endpoints are public read-only `info` calls — no signature required.
 * Refetched every 10 s when the address is set.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Hex } from "viem";

import { getInfoClient } from "../lib/hyperliquid/client";

const POLL_MS = 10_000;

export type HyperliquidBalances = {
  /** Perp account value in USDC, e.g. "12.345" */
  perpUsdc: string;
  /** Spot USDC balance, e.g. "0.0" */
  spotUsdc: string;
  /** Spot USOL balance, e.g. "0.0" */
  spotUsol: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

const DEFAULT: HyperliquidBalances = {
  perpUsdc: "0",
  spotUsdc: "0",
  spotUsol: "0",
  isLoading: false,
  isError: false,
  refetch: async () => undefined,
};

export function hyperliquidBalancesQueryKey(address?: string) {
  return ["hyperliquid", "balances", address?.toLowerCase()] as const;
}

export function useHyperliquidBalances(
  hlEvmAddress?: string,
): HyperliquidBalances {
  const enabled = Boolean(hlEvmAddress && hlEvmAddress.startsWith("0x"));

  const query = useQuery({
    queryKey: hyperliquidBalancesQueryKey(hlEvmAddress),
    enabled,
    refetchInterval: POLL_MS,
    staleTime: POLL_MS / 2,
    queryFn: async ({ signal }) => {
      const info = getInfoClient();
      const user = hlEvmAddress as Hex;
      const [perp, spot] = await Promise.all([
        info.clearinghouseState({ user }, signal),
        info.spotClearinghouseState({ user }, signal),
      ]);
      return { perp, spot };
    },
  });

  return useMemo<HyperliquidBalances>(() => {
    if (!enabled) return DEFAULT;
    const data = query.data;
    if (!data) {
      return {
        ...DEFAULT,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
      };
    }
    const usdc = data.spot.balances.find((b) => b.coin === "USDC");
    const usol = data.spot.balances.find((b) => b.coin === "USOL");
    return {
      perpUsdc: data.perp.marginSummary.accountValue,
      spotUsdc: usdc?.total ?? "0",
      spotUsol: usol?.total ?? "0",
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: query.refetch,
    };
  }, [enabled, query.data, query.isLoading, query.isError, query.refetch]);
}

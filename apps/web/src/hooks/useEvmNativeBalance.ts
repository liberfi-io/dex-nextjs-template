"use client";

/**
 * Fetch a wallet's native EVM token balance (ETH for chain id 1,
 * BNB for chain id 56) via the project's `/api/balance` server route.
 *
 * Mirrors the shape and polling cadence of `useSolBalance` so the
 * deposit modal can swap between them based on the selected origin
 * chain without branching its render logic.
 *
 * Refetched every 10 s while the address is valid.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, isAddress } from "viem";

const POLL_MS = 10_000;
const EVM_NATIVE_DECIMALS = 18;
const EVM_NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";

export type EvmNativeChain = "eth" | "bnb";

export type EvmNativeBalance = {
  /** Native token balance in wei (base-10 string for big-int safety). */
  wei: string;
  /** Token-denominated amount (e.g. ETH or BNB) with trailing zeros stripped. */
  native: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

const DEFAULT: EvmNativeBalance = {
  wei: "0",
  native: "0",
  isLoading: false,
  isError: false,
  refetch: async () => undefined,
};

interface BalanceApiEntry {
  address: string;
  balance: string;
  decimals: number;
}

interface BalanceApiResponse {
  balances?: BalanceApiEntry[];
}

export function evmNativeBalanceQueryKey(chain: EvmNativeChain, address?: string) {
  return ["evm", "native-balance", chain, address ?? ""] as const;
}

/**
 * Inputs:
 *   - `chain`: which native token to read (`eth` → Ethereum mainnet,
 *     `bnb` → BNB Smart Chain mainnet). The /api/balance route maps
 *     these to viem chains internally.
 *   - `address`: the EVM wallet address (0x-hex). The query is
 *     disabled until a valid checksum-agnostic address is provided.
 */
export function useEvmNativeBalance(params: {
  chain: EvmNativeChain;
  address: string | undefined;
}): EvmNativeBalance {
  const { chain, address } = params;
  const enabled = Boolean(address && isAddress(address));

  const query = useQuery({
    queryKey: evmNativeBalanceQueryKey(chain, address),
    enabled,
    refetchInterval: POLL_MS,
    staleTime: POLL_MS / 2,
    queryFn: async () => {
      const url = `/api/balance?chain=${encodeURIComponent(
        chain,
      )}&address=${encodeURIComponent(
        address!,
      )}&tokens=${encodeURIComponent(EVM_NATIVE_ADDRESS)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`/api/balance returned ${res.status}`);
      }
      const body = (await res.json()) as BalanceApiResponse;
      // The route returns every requested token; the deposit flow only
      // needs the native entry (address = zero address).
      const entry = body.balances?.find(
        (b) => b.address.toLowerCase() === EVM_NATIVE_ADDRESS,
      );
      return entry?.balance ?? "0";
    },
  });

  return useMemo<EvmNativeBalance>(() => {
    if (!enabled) return DEFAULT;
    const wei = query.data;
    if (typeof wei !== "string") {
      return {
        ...DEFAULT,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
      };
    }
    const native = formatUnits(BigInt(wei), EVM_NATIVE_DECIMALS).replace(
      /\.?0+$/,
      "",
    );
    return {
      wei,
      native: native || "0",
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: query.refetch,
    };
  }, [enabled, query.data, query.isLoading, query.isError, query.refetch]);
}

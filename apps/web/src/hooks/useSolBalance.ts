"use client";

/**
 * Fetch a wallet's native SOL balance (in lamports) via the project's
 * `/api/balance` server route — keeping the self-hosted Solana RPC URL
 * and its `X-API-KEY` strictly server-side. The connected SOL wallet
 * adapter is intentionally NOT used so the deposit modal can read this
 * balance regardless of which chain the user is currently active on
 * (e.g. opening it from the Hyperliquid perpetuals page).
 *
 * Refetched every 10 s while the address is valid.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";

const POLL_MS = 10_000;
const SOL_DECIMALS = 9;
const LAMPORTS_PER_SOL = 1_000_000_000n;
// System program / native SOL marker — matches the `/api/balance` route.
const SOL_NATIVE_ADDRESS = "11111111111111111111111111111111";

export type SolBalance = {
  /** Lamports as a base-10 string (preserves precision for big values). */
  lamports: string;
  /** SOL-denominated amount as a string with up to 9 decimals. */
  sol: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

const DEFAULT: SolBalance = {
  lamports: "0",
  sol: "0",
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

export function solBalanceQueryKey(address?: string) {
  return ["sol", "balance", address ?? ""] as const;
}

export function useSolBalance(address: string | undefined): SolBalance {
  const enabled = Boolean(address && isValidSolAddress(address));

  const query = useQuery({
    queryKey: solBalanceQueryKey(address),
    enabled,
    refetchInterval: POLL_MS,
    staleTime: POLL_MS / 2,
    queryFn: async () => {
      const url = `/api/balance?chain=sol&address=${encodeURIComponent(
        address!,
      )}&tokens=${encodeURIComponent(SOL_NATIVE_ADDRESS)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`/api/balance returned ${res.status}`);
      }
      const body = (await res.json()) as BalanceApiResponse;
      const entry = body.balances?.find((b) => b.address === SOL_NATIVE_ADDRESS);
      return entry?.balance ?? "0";
    },
  });

  return useMemo<SolBalance>(() => {
    if (!enabled) return DEFAULT;
    const lamports = query.data;
    if (typeof lamports !== "string") {
      return {
        ...DEFAULT,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
      };
    }
    return {
      lamports,
      sol: formatLamportsAsSol(lamports),
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: query.refetch,
    };
  }, [enabled, query.data, query.isLoading, query.isError, query.refetch]);
}

function isValidSolAddress(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

// Manually format lamports → SOL to avoid pulling in `LAMPORTS_PER_SOL`
// (and the rest of `@solana/web3.js`'s Connection surface) just for one
// division. Trailing zeros are stripped to match the previous output.
function formatLamportsAsSol(lamports: string): string {
  const value = BigInt(lamports);
  const whole = value / LAMPORTS_PER_SOL;
  const remainder = value % LAMPORTS_PER_SOL;
  if (remainder === 0n) return whole.toString();
  const frac = remainder.toString().padStart(SOL_DECIMALS, "0").replace(/0+$/, "");
  return frac ? `${whole.toString()}.${frac}` : whole.toString();
}

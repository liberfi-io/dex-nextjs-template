"use client";

/**
 * Fetch the SOL balance (in lamports) for an arbitrary Solana address
 * via JSON-RPC `getBalance`. The connected SOL wallet adapter is NOT
 * used because we want this to work regardless of which chain the
 * user is currently active on (e.g. opening the deposit modal from
 * the Hyperliquid perpetuals page).
 *
 * Refetched every 10 s while the address is valid.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const POLL_MS = 10_000;
const SOL_DECIMALS = 9;

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

let _cached: Connection | undefined;
function getConnection(): Connection | undefined {
  if (_cached) return _cached;
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!url) return undefined;
  _cached = new Connection(url, "confirmed");
  return _cached;
}

export function solBalanceQueryKey(address?: string) {
  return ["sol", "balance", address ?? ""] as const;
}

export function useSolBalance(address: string | undefined): SolBalance {
  const conn = getConnection();
  const enabled = Boolean(address && conn && isValidSolAddress(address));

  const query = useQuery({
    queryKey: solBalanceQueryKey(address),
    enabled,
    refetchInterval: POLL_MS,
    staleTime: POLL_MS / 2,
    queryFn: async () => {
      const lamports = await conn!.getBalance(new PublicKey(address!));
      return lamports;
    },
  });

  return useMemo<SolBalance>(() => {
    if (!enabled) return DEFAULT;
    const lamports = query.data;
    if (typeof lamports !== "number") {
      return {
        ...DEFAULT,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
      };
    }
    return {
      lamports: lamports.toString(),
      sol: (lamports / LAMPORTS_PER_SOL).toFixed(SOL_DECIMALS).replace(/\.?0+$/, ""),
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

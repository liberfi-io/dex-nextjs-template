"use client";

import { useTokenQuery } from "@liberfi.io/react";
import { Chain } from "@liberfi.io/types";
import { SOL_TOKEN_ADDRESS } from "./tokens";

export function solQuotePriceFromToken(
  token: { marketData?: { priceInUsd?: string } } | undefined | null,
): number | null {
  const raw = token?.marketData?.priceInUsd;
  if (!raw) return null;
  const price = Number(raw);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export function useSolQuotePrice(): number | null {
  const { data } = useTokenQuery({
    chain: Chain.SOLANA,
    address: SOL_TOKEN_ADDRESS,
  });
  return solQuotePriceFromToken(data);
}

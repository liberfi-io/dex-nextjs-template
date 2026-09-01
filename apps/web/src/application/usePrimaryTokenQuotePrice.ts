"use client";

import { useTokenQuery } from "@liberfi.io/react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { getWrappedToken } from "@liberfi.io/utils";

export function primaryTokenQuotePriceFromToken(
  token: { marketData?: { priceInUsd?: string } } | undefined | null,
): number | null {
  const raw = token?.marketData?.priceInUsd;
  if (!raw) return null;
  const price = Number(raw);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export function usePrimaryTokenQuotePrice(): number | null {
  const { chain } = useCurrentChain();
  const address = getWrappedToken(chain)?.address ?? "";
  const { data } = useTokenQuery({ chain, address }, { enabled: !!address });
  return primaryTokenQuotePriceFromToken(data);
}

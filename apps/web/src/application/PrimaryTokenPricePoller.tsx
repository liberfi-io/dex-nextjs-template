"use client";

import { useTokenQuery } from "@liberfi.io/react";
import { Chain } from "@liberfi.io/types";
import { getWrappedToken } from "@liberfi.io/utils";

export const PRIMARY_TOKEN_PRICE_POLL_INTERVAL_MS = 60_000;

const PRIMARY_TOKEN_PRICE_CHAINS = [
  Chain.SOLANA,
  Chain.ETHEREUM,
  Chain.BINANCE,
] as const;

function PrimaryTokenPriceQuery({ chain }: { chain: Chain }) {
  const address = getWrappedToken(chain)?.address ?? "";

  useTokenQuery(
    { chain, address },
    {
      enabled: !!address,
      refetchInterval: PRIMARY_TOKEN_PRICE_POLL_INTERVAL_MS,
    },
  );

  return null;
}

export function PrimaryTokenPricePoller() {
  return PRIMARY_TOKEN_PRICE_CHAINS.map((chain) => (
    <PrimaryTokenPriceQuery key={chain} chain={chain} />
  ));
}

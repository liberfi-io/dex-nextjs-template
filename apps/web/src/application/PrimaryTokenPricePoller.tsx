"use client";

import { useTokenQuery } from "@liberfi.io/react";
import { Chain } from "@liberfi.io/types";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { getWrappedToken } from "@liberfi.io/utils";

export const PRIMARY_TOKEN_PRICE_POLL_INTERVAL_MS = 60_000;

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
  const { chain } = useCurrentChain();
  return <PrimaryTokenPriceQuery chain={chain} />;
}

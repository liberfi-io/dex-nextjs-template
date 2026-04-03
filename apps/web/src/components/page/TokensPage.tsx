"use client";

import { useParams, redirect } from "next/navigation";
import { useMemo } from "react";
import { chainIdBySlug } from "@liberfi.io/utils";
import { AppRoute } from "@liberfi/ui-dex/libs/routes";
import { TradeDataLoader } from "@liberfi/ui-dex/components/trade";
import { TradeDataProvider } from "@liberfi/ui-dex/components/trade/providers";
import { AxiomTradePage } from "./token-detail/AxiomTradePage";

export function TokensPage() {
  const { slug } = useParams();

  const [chain, address] = (slug ?? []) as [string, string];

  const chainId = useMemo(() => chainIdBySlug(chain), [chain]);

  if (!chainId || !address) {
    return redirect(
      `${AppRoute.trade}/${process.env.NEXT_PUBLIC_DEFAULT_TOKEN_CHAIN}/${process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ADDRESS}`,
    );
  }

  return (
    <TradeDataLoader chainId={chainId} address={address}>
      <TradeDataProvider address={address} chain={chainId}>
        <AxiomTradePage />
      </TradeDataProvider>
    </TradeDataLoader>
  );
}

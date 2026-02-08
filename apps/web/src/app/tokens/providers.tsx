"use client";

import { useParams, redirect } from "next/navigation";
import { PropsWithChildren, useMemo } from "react";
import { chainIdBySlug } from "@liberfi/core";
import { AppRoute } from "@liberfi/ui-dex/dist/libs/routes";
import { TradeDataLoader } from "@liberfi/ui-dex/dist/components/trade";
import { TradeDataProvider } from "@liberfi/ui-dex/dist/components/trade/providers";
import { TradePage } from "@liberfi/ui-dex";

export function Providers({ children }: PropsWithChildren) {
  const { slug } = useParams();

  const [chain, address] = (slug ?? []) as [string, string];

  const chainId = useMemo(() => chainIdBySlug(chain), [chain]);

  // TODO check chain is valid

  // TODO check address is valid

  if (!chainId || !address) {
    return redirect(
      `${AppRoute.trade}/${process.env.NEXT_PUBLIC_DEFAULT_TOKEN_CHAIN}/${process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ADDRESS}`,
    );
  }

  return (
    <TradeDataLoader chainId={chainId} address={address}>
      <TradeDataProvider address={address} chain={chainId}>
        <TradePage />
        {children}
      </TradeDataProvider>
    </TradeDataLoader>
  );
}

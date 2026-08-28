"use client";

import { useParams, redirect } from "next/navigation";
import { useMemo } from "react";
import { chainIdBySlug } from "@liberfi.io/utils";
import { tokenDetailRoute } from "../../application/routes";
import { TokenTradePage } from "./token-detail/TokenTradePage";

/**
 * Token detail entry for the (new) route group.
 *
 * Note: `TradeDataProvider` is deliberately NOT mounted here. The (new)
 * `TokenTradePage` and its descendants do not consume `useTradeDataContext`
 * (its remaining downstream — `TradeHeader` / `TradeFooter` / `TradeTokenTabs`
 * / `RealTimeTradeList` — lives in legacy `TradePage` only), so wrapping the
 * new tree with the provider added zero benefit while forcing every page
 * render through GraphQL mutations / queries (views / favorites / trades).
 * Those calls also crashed in production because `NewAppLayout` does not
 * mount `<GraphQLClientProvider>` — the default empty client made
 * `client.request` undefined and threw `t.request is not a function`.
 * The leftover `(legacy)` tokens providers and `AppLayout` were removed
 * after option-A redirects; do not reintroduce `TradeDataProvider` here.
 */
export function TokensPage() {
  const { slug } = useParams();

  const [chain, address] = (slug ?? []) as [string, string];

  const chainId = useMemo(() => chainIdBySlug(chain), [chain]);

  if (!chainId || !address) {
    return redirect(
      tokenDetailRoute(
        process.env.NEXT_PUBLIC_DEFAULT_TOKEN_CHAIN,
        process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ADDRESS ?? "",
      ),
    );
  }

  return <TokenTradePage chain={chainId} address={address} />;
}

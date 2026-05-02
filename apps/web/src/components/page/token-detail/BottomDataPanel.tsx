"use client";

import { useMemo, useState } from "react";
import { useTokenQuery } from "@liberfi.io/react";
import type { Chain } from "@liberfi.io/types";
import {
  TabBarUnderline,
  type TabBarUnderlineItem,
} from "@liberfi.io/ui-scaffold";
import {
  TokenActivitiesListWidget,
  TokenDevTokensListWidget,
  TokenHoldersListWidget,
  TokenOrdersListWidget,
  TokenPositionsListWidget,
  TokenTopTradersListWidget,
} from "@liberfi.io/ui-tokens";
import { useCurrentWalletAddress, useTranslation } from "@liberfi/ui-base";

type BottomTab =
  | "trades"
  | "positions"
  | "orders"
  | "holders"
  | "top-traders"
  | "dev-tokens";

export interface BottomDataPanelProps {
  chain: Chain;
  address: string;
}

/**
 * Axiom-style bottom data panel with 6 tabs (Trades / Positions / Orders /
 * Holders / Top Traders / Dev Tokens). Composes the matching `@liberfi.io/
 * ui-tokens` widgets for each tab; only the chrome (tab bar + wiring) lives
 * here. Each widget owns its own filter state and data query, so tab
 * switches do not invalidate neighbouring tabs' data.
 */
export function BottomDataPanel({ chain, address }: BottomDataPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<BottomTab>("trades");
  const { data: token } = useTokenQuery({ chain, address });
  const wallet = useCurrentWalletAddress() ?? undefined;

  const holdersCount = token?.marketData?.holders;
  const creator = token?.creators?.[0]?.address;
  const tokenSymbol = token?.symbol;

  const tabItems = useMemo<ReadonlyArray<TabBarUnderlineItem<BottomTab>>>(
    () => [
      { key: "trades", label: t("extend.trade.titles.transactions") },
      { key: "positions", label: "Positions" },
      { key: "orders", label: "Orders" },
      {
        key: "holders",
        label: t("extend.trade.titles.holders"),
        count: holdersCount ?? undefined,
      },
      { key: "top-traders", label: "Top Traders" },
      { key: "dev-tokens", label: "Dev Tokens" },
    ],
    [t, holdersCount],
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <TabBarUnderline<BottomTab>
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {activeTab === "trades" && (
          <TokenActivitiesListWidget
            chain={chain}
            address={address}
            youWalletAddress={wallet}
          />
        )}
        {activeTab === "positions" && (
          <TokenPositionsListWidget chain={chain} wallet={wallet} />
        )}
        {activeTab === "orders" && (
          <TokenOrdersListWidget
            chain={chain}
            wallet={wallet}
            tokenAddress={address}
            tokenSymbol={tokenSymbol}
          />
        )}
        {activeTab === "holders" && (
          <TokenHoldersListWidget chain={chain} address={address} />
        )}
        {activeTab === "top-traders" && (
          <TokenTopTradersListWidget chain={chain} address={address} />
        )}
        {activeTab === "dev-tokens" && (
          <TokenDevTokensListWidget chain={chain} creator={creator} />
        )}
      </div>
    </div>
  );
}

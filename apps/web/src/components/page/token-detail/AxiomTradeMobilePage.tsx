"use client";

import { useMemo, useState } from "react";
import { TradingChart } from "@liberfi/ui-dex/components/trade";
import { useTokenQuery } from "@liberfi.io/react";
import type { Chain } from "@liberfi.io/types";
import {
  CollapsibleSection,
  TabBarUnderline,
  type TabBarUnderlineItem,
} from "@liberfi.io/ui-scaffold";
import {
  TokenAboutWidget,
  TokenActivitiesListWidget,
  TokenCategoriesWidget,
  TokenChartBannerWidget,
  TokenDevTokensListWidget,
  TokenHoldersListWidget,
  TokenLiquiditiesWidget,
  TokenOrdersListWidget,
  TokenPositionsListWidget,
  TokenSecurityWidget,
  TokenStatsFlipWidget,
  TokenTopTradersListWidget,
} from "@liberfi.io/ui-tokens";
import { useCurrentWalletAddress } from "@liberfi/ui-base";
import { TokenDetailHeader } from "./TokenDetailHeader";
import { TradingPanel } from "./TradingPanel";

export interface AxiomTradeMobilePageProps {
  chain: Chain;
  address: string;
}

type TopMode = "trade" | "transactions" | "tables";
type TxTab = "trades" | "holders";
type TableTab = "positions" | "orders" | "top-traders" | "dev-tokens";

/**
 * Mobile token trade page — three-segment top nav (Trade / Transactions /
 * Tables) with a bottom-docked instant buy/sell sheet. The overall flow
 * mirrors Axiom's mobile layout: `Trade` shows the header + compact chart
 * with the trading form pinned to the viewport bottom; `Transactions`
 * focuses on the Trades / Holders lists; `Tables` compresses Positions /
 * Orders / Top Traders / Dev Tokens into a nested tab row.
 */
export function AxiomTradeMobilePage({
  chain,
  address,
}: AxiomTradeMobilePageProps) {
  const [topMode, setTopMode] = useState<TopMode>("trade");
  const { data: token } = useTokenQuery({ chain, address });
  const wallet = useCurrentWalletAddress() ?? undefined;

  const topItems = useMemo<ReadonlyArray<TabBarUnderlineItem<TopMode>>>(
    () => [
      { key: "trade", label: "Trade" },
      { key: "transactions", label: "Transactions" },
      { key: "tables", label: "Tables" },
    ],
    [],
  );

  return (
    <div className="relative flex h-[calc(100vh-0.625rem)] w-full flex-col overflow-hidden bg-background">
      <TabBarUnderline<TopMode>
        items={topItems}
        value={topMode}
        onChange={setTopMode}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {topMode === "trade" && (
          <TradeMode chain={chain} address={address} tokenSymbol={token?.symbol} />
        )}
        {topMode === "transactions" && (
          <TransactionsMode
            chain={chain}
            address={address}
            wallet={wallet}
            holdersCount={token?.marketData?.holders}
          />
        )}
        {topMode === "tables" && (
          <TablesMode
            chain={chain}
            address={address}
            wallet={wallet}
            creator={token?.creators?.[0]?.address}
            tokenSymbol={token?.symbol}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------- Trade mode -------------------------- */

function TradeMode({
  chain,
  address,
  tokenSymbol,
}: {
  chain: Chain;
  address: string;
  tokenSymbol?: string;
}) {
  return (
    <div className="flex flex-col pb-[220px]">
      <TokenDetailHeader chain={chain} address={address} />

      <CollapsibleSection
        title="Token Banner"
        defaultOpen={false}
        className="border-b border-default-100"
      >
        <TokenChartBannerWidget chain={chain} address={address} />
      </CollapsibleSection>

      <TokenStatsFlipWidget
        chain={chain}
        address={address}
        className="border-b border-default-100"
      />

      <div className="h-[360px] border-b border-default-100">
        <TradingChart />
      </div>

      <CollapsibleSection
        title="Token Info"
        defaultOpen={false}
        className="border-b border-default-100"
      >
        <div className="flex flex-col gap-4 p-4 pt-1">
          <TokenAboutWidget chain={chain} address={address} />
          <TokenSecurityWidget chain={chain} address={address} />
          <TokenCategoriesWidget chain={chain} address={address} />
          <TokenLiquiditiesWidget chain={chain} address={address} />
        </div>
      </CollapsibleSection>

      {/* Bottom sheet — instant trade pinned to the viewport */}
      <div
        aria-label={tokenSymbol ? `Trade ${tokenSymbol}` : "Trade"}
        className="fixed bottom-[var(--bottom-navigation-bar-height,0px)] left-0 right-0 z-20 border-t border-default-100 bg-content1/95 backdrop-blur-overlay"
      >
        <TradingPanel />
      </div>
    </div>
  );
}

/* ----------------------- Transactions mode ---------------------- */

function TransactionsMode({
  chain,
  address,
  wallet,
  holdersCount,
}: {
  chain: Chain;
  address: string;
  wallet?: string;
  holdersCount?: number;
}) {
  const [tab, setTab] = useState<TxTab>("trades");

  const items = useMemo<ReadonlyArray<TabBarUnderlineItem<TxTab>>>(
    () => [
      { key: "trades", label: "Trades" },
      { key: "holders", label: "Holders", count: holdersCount ?? undefined },
    ],
    [holdersCount],
  );

  return (
    <div className="flex h-full flex-col">
      <TabBarUnderline<TxTab> items={items} value={tab} onChange={setTab} />
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "trades" && (
          <TokenActivitiesListWidget
            chain={chain}
            address={address}
            youWalletAddress={wallet}
          />
        )}
        {tab === "holders" && (
          <TokenHoldersListWidget chain={chain} address={address} />
        )}
      </div>
    </div>
  );
}

/* -------------------------- Tables mode ------------------------- */

function TablesMode({
  chain,
  address,
  wallet,
  creator,
  tokenSymbol,
}: {
  chain: Chain;
  address: string;
  wallet?: string;
  creator?: string;
  tokenSymbol?: string;
}) {
  const [tab, setTab] = useState<TableTab>("positions");

  const items = useMemo<ReadonlyArray<TabBarUnderlineItem<TableTab>>>(
    () => [
      { key: "positions", label: "Positions" },
      { key: "orders", label: "Orders" },
      { key: "top-traders", label: "Top Traders" },
      { key: "dev-tokens", label: "Dev Tokens" },
    ],
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <TabBarUnderline<TableTab> items={items} value={tab} onChange={setTab} />
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "positions" && (
          <TokenPositionsListWidget chain={chain} wallet={wallet} />
        )}
        {tab === "orders" && (
          <TokenOrdersListWidget
            chain={chain}
            wallet={wallet}
            tokenAddress={address}
            tokenSymbol={tokenSymbol}
          />
        )}
        {tab === "top-traders" && (
          <TokenTopTradersListWidget chain={chain} address={address} />
        )}
        {tab === "dev-tokens" && (
          <TokenDevTokensListWidget chain={chain} creator={creator} />
        )}
      </div>
    </div>
  );
}

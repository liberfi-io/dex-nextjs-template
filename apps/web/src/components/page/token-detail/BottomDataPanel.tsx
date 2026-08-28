"use client";

import { useMemo, useState } from "react";
import { useTokenQuery } from "@liberfi.io/react";
import type { Chain } from "@liberfi.io/types";
import {
  TabBarUnderline,
  type TabBarUnderlineItem,
} from "@liberfi.io/ui-scaffold";
import { useTranslation } from "@liberfi.io/i18n";
import { BottomDevTokensTable } from "./bottom-tables/BottomDevTokensTable";
import { BottomHoldersTable } from "./bottom-tables/BottomHoldersTable";
import { BottomTopTradersTable } from "./bottom-tables/BottomTopTradersTable";
import { BottomTradesTable } from "./bottom-tables/BottomTradesTable";

type BottomTab = "trades" | "holders" | "top-traders" | "dev-tokens";

export interface BottomDataPanelProps {
  chain: Chain;
  address: string;
}

/**
 * GMGN-style bottom data panel with 4 tabs (Trades / Holders / Top Traders
 * / Dev Tokens). Each tab renders a local table component tuned to mirror
 * GMGN's layout — column labels, alignment, color rules, and compact
 * formatting all match the design reference §7 (Activity Table) and §8.7
 * (Holder/Trader/Dev token lists).
 *
 * The Top Traders and Dev Tokens tabs are pure header-only placeholders
 * for now; the upstream data pipeline does not yet expose those signals.
 * Showing the GMGN column structure now keeps the panel feeling complete
 * and avoids a layout shift when the data lands later.
 */
export function BottomDataPanel({ chain, address }: BottomDataPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<BottomTab>("trades");
  const { data: token } = useTokenQuery({ chain, address });

  const holdersCount = token?.marketData?.holders;

  const tabItems = useMemo<ReadonlyArray<TabBarUnderlineItem<BottomTab>>>(
    () => [
      { key: "trades", label: t("extend.trade.titles.activities") },
      {
        key: "holders",
        label: t("extend.trade.titles.holders"),
        count: holdersCount ?? undefined,
      },
      { key: "top-traders", label: t("extend.trade.titles.top_traders") },
      { key: "dev-tokens", label: t("extend.trade.titles.dev_tokens") },
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

      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === "trades" && (
          <BottomTradesTable chain={chain} address={address} />
        )}
        {activeTab === "holders" && (
          <BottomHoldersTable chain={chain} address={address} />
        )}
        {activeTab === "top-traders" && (
          <BottomTopTradersTable chain={chain} address={address} />
        )}
        {activeTab === "dev-tokens" && (
          <BottomDevTokensTable chain={chain} address={address} />
        )}
      </div>
    </div>
  );
}

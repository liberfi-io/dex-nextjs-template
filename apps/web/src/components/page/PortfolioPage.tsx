"use client";

import { Key, useState } from "react";
import { Tab, Tabs } from "@heroui/react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  PortfolioActivitiesWidget,
  PortfolioNetWorthTokensWidget,
  PortfolioPnlDetailsWidget,
} from "@liberfi.io/ui-portfolio";
import {
  useCurrentWalletAddress,
  useHideHeader,
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
} from "@liberfi/ui-base";
import { AccountHeader, AccountOverview } from "@liberfi/ui-dex";

type PortfolioTab = "assets" | "pnl" | "activities";

export function PortfolioPage() {
  useHideHeader("tablet");
  useShowBottomNavigationBar("tablet");
  useSetBottomNavigationBarActiveKey("account");

  const [tab, setTab] = useState<PortfolioTab>("assets");
  const { chain } = useCurrentChain();
  const address = useCurrentWalletAddress();

  return (
    <div className="relative w-full h-full">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at center, #c7ff2e 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div className="relative z-[1] w-full max-w-[860px] h-full mx-auto lg:p-6 overflow-auto">
        <AccountHeader />
        <AccountOverview />

        <div className="mt-4">
          <Tabs
            size="sm"
            variant="underlined"
            selectedKey={tab}
            onSelectionChange={setTab as (key: Key) => void}
            classNames={{
              base: "px-2 lg:px-0",
              tabList: "gap-6 p-0",
              tab: "px-0 h-10 min-w-0 w-auto text-sm font-medium",
              cursor: "bg-foreground",
            }}
            disableAnimation
          >
            <Tab key="assets" title="Assets" />
            <Tab key="pnl" title="PnL" />
            <Tab key="activities" title="Activities" />
          </Tabs>
        </div>

        <div className="mt-2 px-2 lg:px-0">
          {!address ? (
            <WalletEmptyState />
          ) : tab === "assets" ? (
            <PortfolioNetWorthTokensWidget chain={chain} address={address} />
          ) : tab === "pnl" ? (
            <PortfolioPnlDetailsWidget chain={chain} address={address} />
          ) : (
            <PortfolioActivitiesWidget chain={chain} address={address} />
          )}
        </div>
      </div>
    </div>
  );
}

function WalletEmptyState() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-neutral">
      Connect a wallet to view your portfolio.
    </div>
  );
}

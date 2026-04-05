import { Key, useState } from "react";
import { Tab, Tabs } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { RealtimeTradeList } from "@liberfi/ui-dex/components/trade/rich_info/RealTimeTradeList";
import { TradeTokenHolders } from "@liberfi/ui-dex/components/trade/rich_info/TradeTokenHolders";
import { useAtomValue } from "jotai";
import { tokenInfoAtom } from "@liberfi/ui-dex/states";

type BottomTab = "trades" | "positions" | "orders" | "holders" | "top-traders" | "dev-tokens";

export function BottomDataPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<BottomTab>("trades");
  const token = useAtomValue(tokenInfoAtom);

  const holdersCount = token?.marketData?.holders;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Tab bar — Axiom: relative flex flex-1 min-h-37 max-h-37 px-8 border-b gap-0 */}
      <div className="relative flex flex-1 flex-row min-h-[37px] max-h-[37px] items-center justify-start border-b border-neutral-800 px-2 gap-0">
        {/* Inner container — Axiom: flex flex-1 gap=16px overflow-x-auto jc=space-between */}
        <div className="flex flex-1 flex-row items-center gap-4 overflow-x-auto hide-scrollbar justify-between">
          {/* Tab items — Axiom: flex h=36px gap=16px */}
          <div className="flex flex-row h-[36px] items-center justify-start gap-4">
            <Tabs
              size="sm"
              variant="underlined"
              selectedKey={activeTab}
              onSelectionChange={setActiveTab as (key: Key) => void}
              classNames={{
                base: "flex-none",
                tabList: "gap-4 p-0",
                tab: "px-0 h-[36px] min-w-0 w-auto text-sm font-medium leading-[21px] data-[selected=true]:text-[rgb(252,252,252)] text-[rgb(200,201,209)]",
                tabContent: "text-inherit",
                cursor: "bg-foreground",
              }}
              disableAnimation
            >
              <Tab key="trades" title={t("extend.trade.titles.transactions")} />
              <Tab key="positions" title="Positions" />
              <Tab key="orders" title="Orders" />
              <Tab
                key="holders"
                title={
                  <span>
                    {t("extend.trade.titles.holders")}
                    {holdersCount != null && (
                      <span className="ml-0.5 text-neutral">({holdersCount})</span>
                    )}
                  </span>
                }
              />
              <Tab key="top-traders" title="Top Traders" />
              <Tab key="dev-tokens" title="Dev Tokens" />
            </Tabs>
          </div>

          {/* Toolbar toggles — Axiom: flex gap=8px text-nowrap */}
          <div className="flex flex-row items-center gap-2 text-nowrap flex-none">
            <ToolbarToggle label="Show Hidden" />
            <ToolbarToggle label="Instant Trade" active pill />
            <ToolbarToggle label="Trades Panel" plain />
            <ToolbarToggle label="↕ USD" plain />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "trades" && <RealtimeTradeList />}
        {activeTab === "positions" && <PositionsPlaceholder />}
        {activeTab === "orders" && <EmptyPlaceholder text="No orders" />}
        {activeTab === "holders" && <TradeTokenHolders />}
        {activeTab === "top-traders" && <EmptyPlaceholder text="Coming soon" />}
        {activeTab === "dev-tokens" && <EmptyPlaceholder text="Coming soon" />}
      </div>
    </div>
  );
}

function PositionsPlaceholder() {
  return (
    <div className="w-full">
      <div className="flex items-center h-7 px-3 text-xs text-[rgb(119,122,140)] border-b border-neutral-800/50">
        <span className="flex-1">Token</span>
        <span className="w-20 text-right">Bought</span>
        <span className="w-20 text-right">Sold</span>
        <span className="w-20 text-right">Remaining</span>
        <span className="w-20 text-right">PnL</span>
        <span className="w-16 text-right">Actions</span>
      </div>
      <div className="flex items-center justify-center h-12 text-[11px] text-neutral">
        No positions
      </div>
    </div>
  );
}

function ToolbarToggle({
  label,
  active,
  pill,
  plain,
}: {
  label: string;
  active?: boolean;
  pill?: boolean;
  plain?: boolean;
}) {
  const activeColor = "text-[rgb(82,111,255)]";
  const inactiveColor = "text-[rgb(119,122,140)] hover:text-[rgb(200,201,209)]";

  if (plain) {
    return (
      <button
        className={`flex items-center gap-1 text-base font-normal leading-6 h-6 px-2 rounded transition-colors ${
          active ? "text-[rgb(252,252,252)]" : "text-[rgb(252,252,252)] hover:text-white"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      className={`flex items-center gap-1 text-xs transition-colors ${
        pill
          ? `h-[26px] py-1 pl-2 pr-3 rounded-full border border-neutral-700 font-normal ${
              active ? activeColor : inactiveColor
            }`
          : `h-[26px] py-1 px-2 rounded border border-neutral-700 font-medium ${
              active ? activeColor : inactiveColor
            }`
      }`}
    >
      {active && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <rect width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
          <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}

function EmptyPlaceholder({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-full text-[11px] text-neutral">
      {text}
    </div>
  );
}

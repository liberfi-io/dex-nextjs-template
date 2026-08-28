"use client";

import { useMemo, useState, type Key, type ReactNode } from "react";
import type { Chain } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi.io/i18n";
import { PortfolioAssetsTable } from "./bottom-tables/PortfolioAssetsTable";
import { PortfolioActivitiesTable } from "./bottom-tables/PortfolioActivitiesTable";

type PortfolioBottomTab = "assets" | "activities";

export interface PortfolioBottomPanelProps {
  chain: Chain;
  address: string;
}

/**
 * Tab-switched bottom panel for the portfolio page.
 *
 * The tab bar is a local pill-style component rather than the shared
 * `TabBarUnderline` used on the token-detail page. Two design reasons:
 *
 *   1. The portfolio panel is a self-contained card (rounded border +
 *      content1 background); against that frame the underline tabs
 *      from the token-detail page sit too close to the rounded corner
 *      and the active 2px underline reads as a hard horizontal slash
 *      across the card. A pill-shaped active state stays inside the
 *      tab's clickable area and feels at home in a card.
 *   2. The portfolio only has 2 tabs (Assets / Activities). With so
 *      few items the underline rhythm felt sparse; pills give each
 *      tab a more deliberate visual weight.
 */
export function PortfolioBottomPanel({
  chain,
  address,
}: PortfolioBottomPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PortfolioBottomTab>("assets");

  const tabItems = useMemo<
    ReadonlyArray<PortfolioTabItem<PortfolioBottomTab>>
  >(
    () => [
      { key: "assets", label: t("extend.portfolio.tabs.assets") },
      { key: "activities", label: t("extend.portfolio.tabs.activities") },
    ],
    [t],
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-default-100 bg-content1">
      <PortfolioTabBar<PortfolioBottomTab>
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* Inner padding: gives the table breathing room from the panel's
          rounded border. Mobile = 8px sides / 8px bottom; desktop =
          12px sides / 8px bottom. Adds up with the table's per-cell
          `px-3` (12px) so the first column header sits ~20px (mobile)
          / ~24px (desktop) from the panel edge — the rhythm matches
          the header + chart cards above. */}
      <div className="min-h-0 flex-1 overflow-hidden px-2 lg:px-3 pb-2">
        {activeTab === "assets" && (
          <PortfolioAssetsTable chain={chain} address={address} />
        )}
        {activeTab === "activities" && (
          <PortfolioActivitiesTable chain={chain} address={address} />
        )}
      </div>
    </div>
  );
}

interface PortfolioTabItem<K extends Key> {
  key: K;
  label: ReactNode;
}

interface PortfolioTabBarProps<K extends Key> {
  items: ReadonlyArray<PortfolioTabItem<K>>;
  value: K;
  onChange: (key: K) => void;
}

/**
 * Pill-style tab bar local to the portfolio panel.
 *
 * Design choices:
 *   - Outer wrapper: `border-b border-default-100` to delimit the tab
 *     row from the table; horizontal padding (`px-2 lg:px-3`) matches
 *     the table content's outer padding so the first tab's clickable
 *     area aligns with the table's first column.
 *   - Inactive tabs: `text-default-500` with a faint hover background
 *     (`bg-default-100/50`) for affordance.
 *   - Active tab: solid `bg-default-100` pill + `text-foreground`. The
 *     pill is `rounded-full` rather than a hard underline so it sits
 *     comfortably inside the rounded card without competing visually
 *     with the panel's border.
 */
function PortfolioTabBar<K extends Key>({
  items,
  value,
  onChange,
}: PortfolioTabBarProps<K>) {
  return (
    <div className="flex items-center gap-1 border-b border-default-100 px-2 lg:px-3 py-2">
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={String(item.key)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap",
              active
                ? "bg-default-100 text-foreground"
                : "text-default-500 hover:text-foreground hover:bg-default-100/50",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

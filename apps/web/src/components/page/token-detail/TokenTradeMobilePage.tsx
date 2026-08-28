"use client";

import { TradingChart } from "../../TradingChart";
import type { Chain } from "@liberfi.io/types";
import { useTokenQuery } from "@liberfi.io/react";
import {
  TabBarUnderline,
  type TabBarUnderlineItem,
} from "@liberfi.io/ui-scaffold";
import { useTranslation } from "@liberfi.io/i18n";
import { useMemo, useRef, useState } from "react";
import { BottomDevTokensTable } from "./bottom-tables/BottomDevTokensTable";
import { BottomHoldersTable } from "./bottom-tables/BottomHoldersTable";
import { BottomTopTradersTable } from "./bottom-tables/BottomTopTradersTable";
import { BottomTradesTable } from "./bottom-tables/BottomTradesTable";
import { TableShellScrollRootProvider } from "./bottom-tables/table-shell";
import { MobileTradeBar } from "./MobileTradeBar";
import { SidebarBasicInfo } from "./SidebarBasicInfo";
import { SidebarSecurityCheck } from "./SidebarSecurityCheck";
import { SidebarTokenAudit } from "./SidebarTokenAudit";
import { SidebarVolumeStats } from "./SidebarVolumeStats";
import { TokenDetailHeaderMobile } from "./TokenDetailHeaderMobile";

export interface TokenTradeMobilePageProps {
  chain: Chain;
  address: string;
}

type BottomTab = "trades" | "holders" | "top-traders" | "dev-tokens";

/**
 * Fixed height (in px) reserved for the bottom-anchored {@link MobileTradeBar}
 *  trigger. ≈64px = 44px button + 12px top padding + 8px safe-area baseline;
 *  iOS bumps the bottom inset via `env(safe-area-inset-bottom)`. Used to pad
 *  the scroll container so the last list row isn't obscured by the floating
 *  CTA bar.
 */
const TRADE_BAR_RESERVE_PX = 64;

/**
 * K-line chart height on mobile. Must match {@link TradingChart}'s intrinsic
 *  mobile height (`h-[400px]`) — that component sets a fixed 400px below the
 *  `md` breakpoint, so any container shorter than 400px causes the chart's
 *  bottom toolbar (timeframe / date-range icons) to bleed into the audit grid
 *  below it.
 */
const MOBILE_CHART_HEIGHT_PX = 400;

/**
 * Mobile token detail page — GMGN-style single-scroll layout.
 *
 * Structure (top → bottom, all inside the same scroll container):
 *
 *   ┌─ TokenDetailHeaderMobile      (avatar / symbol / price)
 *   ├─ SidebarVolumeStats           (1m / 5m / 1h / 24h tabs + volume row)
 *   ├─ TradingChart                 (360px K-line)
 *   ├─ SidebarTokenAudit            (concentration / cohort grid)
 *   ├─ SidebarBasicInfo             (collapsible)
 *   ├─ SidebarSecurityCheck         (collapsible)
 *   ├─ Sticky TabBarUnderline       (Trades / Holders / Top Traders / Dev)
 *   └─ Selected bottom table        (renders inline, no internal scroll —
 *                                    rows flow as part of the page scroll
 *                                    and infinite-load via the shared
 *                                    scroll-root observer)
 *
 * Fixed elements outside the scroll container:
 *
 *   • {@link TradingPanel} anchored to the bottom edge as a floating sheet
 *     (same component the desktop sidebar uses, reused for visual /
 *     behavioural consistency).
 *
 * Why a single scroll instead of internal table scrolling: GMGN's mobile
 * page uses a single scrollable column where the holder/activity list
 * flows directly from the chart — there is no nested scroll. To get the
 * same feel without duplicating each table, we expose the page's scroll
 * container via {@link TableShellScrollRootProvider}; tables read the ref
 * from context and (a) skip their own `overflow-auto` wrapper, (b) attach
 * the IntersectionObserver-driven sentinel to the page scroll instead.
 *
 * All section components are imported as-is from the desktop layout
 * (`SidebarVolumeStats`, `SidebarTokenAudit`, `SidebarBasicInfo`,
 * `SidebarSecurityCheck`, the four `Bottom*Table`s) so we only need to
 * maintain one set of styles + i18n keys per section.
 */
export function TokenTradeMobilePage({
  chain,
  address,
}: TokenTradeMobilePageProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<BottomTab>("trades");
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
    <div className="relative flex h-[calc(100vh-0.625rem)] w-full flex-col overflow-hidden bg-background">
      <TableShellScrollRootProvider value={scrollRef}>
        <div
          ref={scrollRef}
          className="custom-scrollbar min-h-0 flex-1 overflow-auto"
          style={{ paddingBottom: TRADE_BAR_RESERVE_PX }}
        >
          <TokenDetailHeaderMobile chain={chain} address={address} />
          <SidebarVolumeStats chain={chain} address={address} />

          {/* Chart slot.
              - `overflow-hidden` clips the TradingView widget's internal
                toolbars so they cannot bleed into the audit grid below
                (previously the timeframe / date-range icons rendered
                ~40px past the container, visually overlapping the
                "前 10 / 開發者 / 持有人 / 狙擊者" row).
              - Height is locked to MOBILE_CHART_HEIGHT_PX which equals
                TradingChart's intrinsic mobile height — keeping them in
                sync prevents the chart's internal `h-[400px]` from
                fighting a shorter parent. */}
          <div
            style={{ height: MOBILE_CHART_HEIGHT_PX }}
            className="shrink-0 overflow-hidden border-b border-divider"
          >
            <TradingChart chain={chain} address={address} />
          </div>

          <SidebarTokenAudit chain={chain} address={address} />
          <SidebarBasicInfo chain={chain} address={address} />
          <SidebarSecurityCheck chain={chain} address={address} />

          {/* Sticky tab bar — anchors to the top of the scroll container
              once the user scrolls past the chart + info sections, so the
              user can switch tabs without scrolling back up. The sticky
              context is the scroll container itself (`top: 0`). */}
          <div className="sticky top-0 z-20 border-b border-divider bg-content1">
            <TabBarUnderline<BottomTab>
              items={tabItems}
              value={tab}
              onChange={setTab}
            />
          </div>

          {/* Active table — embedded mode (no internal scroll). The
              IntersectionObserver sentinel observes the page scroll via
              the provider above. */}
          {tab === "trades" && (
            <BottomTradesTable chain={chain} address={address} />
          )}
          {tab === "holders" && (
            <BottomHoldersTable chain={chain} address={address} />
          )}
          {tab === "top-traders" && (
            <BottomTopTradersTable chain={chain} address={address} />
          )}
          {tab === "dev-tokens" && (
            <BottomDevTokensTable chain={chain} address={address} />
          )}
        </div>
      </TableShellScrollRootProvider>

      {/* Mobile trade CTA bar. Replaces the previously always-visible
          TradingPanel (which covered ~240px of content). The bar shows
          only the Buy / Sell triggers; tapping either opens a HeroUI
          bottom-sheet modal containing the full TradingPanel pre-seeded
          to the tapped direction. This mirrors GMGN's mobile pattern
          and keeps the chart + lists the primary viewport content. */}
      <MobileTradeBar
        chain={chain}
        tokenAddress={address}
        tokenSymbol={token?.symbol}
      />
    </div>
  );
}

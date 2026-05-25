"use client";

import { useCallback, useRef, useState } from "react";
import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";
import { TradingChart } from "@liberfi/ui-dex/components/trade";
import type { Chain } from "@liberfi.io/types";
import { useScreen } from "@liberfi.io/ui";
import {
  AxiomSplitHandle,
  CollapsibleSection,
} from "@liberfi.io/ui-scaffold";
import {
  TokenAboutWidget,
  TokenCategoriesWidget,
  TokenLiquiditiesWidget,
  TokenReusedImageListWidget,
  TokenSecurityWidget,
  TokenSimilarTokensWidget,
} from "@liberfi.io/ui-tokens";
import { useTokenQuery } from "@liberfi.io/react";
import { BottomDataPanel } from "./BottomDataPanel";
import { AxiomTradeMobilePage } from "./AxiomTradeMobilePage";
import { SidebarVolumeStats } from "./SidebarVolumeStats";
import { TokenDetailHeader } from "./TokenDetailHeader";
import { TradingPanel } from "./TradingPanel";

const MIN_CHART_H = 200;
const DEFAULT_CHART_H = 448; // matches GMGN default chart height

export interface AxiomTradePageProps {
  chain: Chain;
  address: string;
}

/**
 * Desktop / tablet token trade page. Dispatches to the mobile variant via
 * `useScreen().isMobile`. Two-level scrolling (GMGN-style):
 *   1. Page-level scroll — the bottom panel's viewport-relative height +
 *      chart + header pushes total content past the outer container height,
 *      so the outer `overflow-auto` scrolls to reveal the full table area.
 *   2. Independent activity-table scroll inside {@link BottomDataPanel}
 *      (the panel is constrained via `overflow-hidden`; inner `flex-1
 *      overflow-auto` handles the table body).
 */
export function AxiomTradePage({ chain, address }: AxiomTradePageProps) {
  useHideHeader("tablet");
  useHideBottomNavigationBar();

  const { isMobile } = useScreen();
  if (isMobile) {
    return <AxiomTradeMobilePage chain={chain} address={address} />;
  }

  return <AxiomTradeDesktopPage chain={chain} address={address} />;
}

// Token header (~70px) + split handle (~6px)
const HEADER_AND_HANDLE_H = 76;

function AxiomTradeDesktopPage({ chain, address }: AxiomTradePageProps) {
  const [chartH, setChartH] = useState(DEFAULT_CHART_H);
  const outerRef = useRef<HTMLDivElement>(null);

  const { data: token } = useTokenQuery({ chain, address });
  const tokenSymbol = token?.symbol;

  // Dragging the handle UP (toward chart) → shrinks chart, grows bottom.
  // Dragging DOWN → grows chart but stops when the bottom panel reaches
  // its minimum height (~200px), matching GMGN's hard drag limit.
  const handleDrag = useCallback((delta: number) => {
    setChartH((prev) => {
      const next = prev + delta;
      const outerH =
        outerRef.current?.getBoundingClientRect().height ?? 800;
      const maxChart = outerH - HEADER_AND_HANDLE_H - 200;
      return Math.max(MIN_CHART_H, Math.min(next, maxChart));
    });
  }, []);

  return (
    // Page-level scroll container.
    <div
      ref={outerRef}
      className="relative flex h-[calc(100vh-0.625rem)] w-full flex-col overflow-auto md:h-[calc(100vh-0.625rem)] lg:h-[calc(100vh-var(--header-height)-2.875rem)]"
    >
      <div className="flex">
        {/* Left column — grows with content; total height = header + chart
            + handle + bottom panel. When this exceeds the outer container
            height the page scrolls. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TokenDetailHeader chain={chain} address={address} />

          {/* Chart — fixed height, resizable via split handle */}
          <div style={{ height: chartH }} className="flex-shrink-0">
            <TradingChart />
          </div>

          <AxiomSplitHandle
            orientation="horizontal"
            onDrag={handleDrag}
          />

          {/* Bottom panel — takes ~full viewport height (minus token header
              + handle), same as GMGN's table body taking 740px in an 810px
              viewport. This makes total content (header + chart + handle +
              bottom) ≈ 1.5× viewport → outer overflow-auto scrolls to
              reveal the full table area. Inside, BottomDataPanel's internal
              flex-1 overflow-auto handles independent table scrolling. */}
          <div className="flex-shrink-0 overflow-hidden h-[calc(100vh-0.625rem-80px)] lg:h-[calc(100vh-var(--header-height)-2.875rem-80px)]">
            <BottomDataPanel chain={chain} address={address} />
          </div>
        </div>

        {/* Right sidebar — natural height (no fixed h), content determines
            how tall it is. Scrolls with the page so lower cards (Token Info,
            Similar Tokens, etc.) come into view as the user scrolls down.
            Matches GMGN's right panel (1693px content, no fixed height). */}
        <aside className="custom-scrollbar hidden w-[320px] min-w-[320px] max-w-[320px] flex-shrink-0 flex-col border-l border-default-100 md:flex">
          <SidebarVolumeStats chain={chain} address={address} />
          <TradingPanel />

          <CollapsibleSection
            title="Token Info"
            defaultOpen
            className="border-t border-default-100"
          >
            <div className="flex flex-col gap-4 p-4 pt-1">
              <TokenAboutWidget chain={chain} address={address} />
              <TokenSecurityWidget chain={chain} address={address} />
              <TokenCategoriesWidget chain={chain} address={address} />
              <TokenLiquiditiesWidget chain={chain} address={address} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Reused Image Tokens"
            defaultOpen={false}
            className="border-t border-default-100"
          >
            <TokenReusedImageListWidget chain={chain} address={address} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Similar Tokens"
            defaultOpen
            className="border-t border-default-100"
          >
            <TokenSimilarTokensWidget
              chain={chain}
              address={address}
              keyword={tokenSymbol}
            />
          </CollapsibleSection>
        </aside>
      </div>
    </div>
  );
}

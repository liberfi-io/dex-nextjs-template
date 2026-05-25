"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

/** Minimum chart height — below this TradingView becomes unusable. */
const MIN_CHART_H = 200;

/** Default chart height — matches GMGN's default. */
const DEFAULT_CHART_H = 448;

/** Visible height of the split handle bar (excludes its invisible grab zone). */
const SPLIT_HANDLE_H = 4;

/**
 * Minimum height of BottomDataPanel that must remain visible in the initial
 * viewport when the chart is pulled to its maximum size. Acts as the floor
 * when computing the chart's upper drag bound.
 */
const MIN_BOTTOM_REVEAL = 200;

/** Fallback header height before the ResizeObserver has measured the DOM. */
const FALLBACK_HEADER_H = 70;

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

function AxiomTradeDesktopPage({ chain, address }: AxiomTradePageProps) {
  const [chartH, setChartH] = useState(DEFAULT_CHART_H);
  // Dynamic height for the bottom data panel container. Synchronised with
  // the right-sidebar panel's natural content height so the LEFT column's
  // overflow is exactly `max(0, sidebarPanel.h - outer.h)` — that way
  // scrolling to the bottom lands the sidebar's last card flush with the
  // outer viewport's bottom edge instead of leaving an empty gap below.
  // `undefined` until first measurement, in which case the Tailwind
  // fallback (viewport-sized) is used.
  const [bottomPanelH, setBottomPanelH] = useState<number | undefined>(
    undefined,
  );
  const outerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarPanelRef = useRef<HTMLDivElement>(null);
  // Latest measured token-header height. Held in a ref so handleDrag stays
  // referentially stable while still seeing the current value (no need to
  // depend on it inside useCallback).
  const headerHRef = useRef(FALLBACK_HEADER_H);

  const { data: token } = useTokenQuery({ chain, address });
  const tokenSymbol = token?.symbol;

  // Track the actual rendered height of the token header so the drag bounds
  // stay accurate even when header content (avatar, stat grid, line wrap)
  // changes layout.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (typeof h === "number" && h > 0) {
        headerHRef.current = h;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sync the BottomDataPanel container height so the LEFT column's total
  // natural height equals `max(outer.h + chart + handle, sidebarPanel.h)`.
  // The two terms encode two requirements derived from GMGN's behaviour:
  //
  //   1. `outer.h + chart + handle` — ensures the page is always taller
  //      than the viewport so the chart (and split handle) can scroll
  //      fully out of view. This matches GMGN, where `outer.scrollable`
  //      always equals roughly chart_h + handle_h regardless of sidebar
  //      state, so wheeling anywhere on the page moves the chart out.
  //   2. `sidebarPanel.h` — when the sidebar is taller than the chart-
  //      scroll baseline (all collapsibles open, lots of widgets),
  //      leftCol grows further so the outer scroll exposes the whole
  //      sidebar. Scrolling to the bottom in that case lands the
  //      sidebar's last card flush with the outer viewport bottom.
  //
  // When the sidebar is shorter than `outer.h + chart + handle`
  // (collapsibles folded), the page still scrolls by ≈ chart height —
  // matching GMGN's "always taller than one screen" feel — but the
  // sidebar's lower area becomes the same empty layout slot GMGN also
  // has when its sidebar is short. Since the aside has no visible
  // border / background, that area blends with the main background.
  //
  // Recomputed on:
  //   - sidebar panel size changes (collapsibles toggling, widget data
  //     loading) via ResizeObserver
  //   - outer container size changes (viewport resize)
  //   - chartH changes (user drags the split handle) via the effect dep
  useEffect(() => {
    function recompute() {
      const outer = outerRef.current;
      const panel = sidebarPanelRef.current;
      if (!outer || !panel) return;
      const outerH = outer.clientHeight;
      const panelH = panel.scrollHeight;
      const chartScrollBaseline = outerH + chartH + SPLIT_HANDLE_H;
      const leftColTarget = Math.max(chartScrollBaseline, panelH);
      const fixedH = headerHRef.current + chartH + SPLIT_HANDLE_H;
      const target = Math.max(MIN_BOTTOM_REVEAL, leftColTarget - fixedH);
      setBottomPanelH(target);
    }
    recompute();
    const outer = outerRef.current;
    const panel = sidebarPanelRef.current;
    if (!outer || !panel) return;
    const observer = new ResizeObserver(recompute);
    observer.observe(outer);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [chartH]);

  // Dragging the handle UP (toward chart) → shrinks chart, grows bottom.
  // Dragging DOWN → grows chart but stops when the bottom panel's initial
  // viewport reveal drops below MIN_BOTTOM_REVEAL, matching GMGN's hard
  // drag limit.
  const handleDrag = useCallback((delta: number) => {
    setChartH((prev) => {
      const next = prev + delta;
      const outerH =
        outerRef.current?.getBoundingClientRect().height ?? 800;
      const maxChart =
        outerH - headerHRef.current - SPLIT_HANDLE_H - MIN_BOTTOM_REVEAL;
      return Math.max(MIN_CHART_H, Math.min(next, maxChart));
    });
  }, []);

  return (
    // Page-level scroll container — outer overflow-auto captures the
    // overflow from the LEFT column's natural content height. This mirrors
    // GMGN's structure where the outer `<main>` is the single scroll
    // viewport for the page.
    <div
      ref={outerRef}
      className="relative h-[calc(100vh-0.625rem)] w-full overflow-auto md:h-[calc(100vh-0.625rem)] lg:h-[calc(100vh-var(--header-height)-2.875rem)]"
    >
      {/* Inner flex row pinned to outer viewport via `min-h-full`, matching
          GMGN's `flex relative min-h-full`. This anchors the row to the
          outer container's height as a *minimum*; if the LEFT column's
          natural content (header + chart + handle + bottom panel) is
          taller, the row grows with it and the outer overflow-auto
          captures the excess as page scroll. */}
      <div className="relative flex min-h-full">
        {/* Left column — grows with content; total height = header + chart
            + handle + bottom panel. When this exceeds the outer container
            height the page scrolls. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={headerRef}>
            <TokenDetailHeader chain={chain} address={address} />
          </div>

          {/* Chart — fixed height, resizable via split handle */}
          <div style={{ height: chartH }} className="flex-shrink-0">
            <TradingChart />
          </div>

          <AxiomSplitHandle
            orientation="horizontal"
            onDrag={handleDrag}
          />

          {/* Bottom panel — height is driven by `bottomPanelH` state which
              syncs with `max(outer.h, sidebarPanel.h) - (header + chart +
              handle)`. The Tailwind `h-[calc(...)]` is a pre-measurement
              fallback (also covers SSR); the inline `style.height` from
              `bottomPanelH` overrides it once the observers have run.
              Inside, BottomDataPanel's `flex h-full flex-col` + internal
              `flex-1 overflow-auto` keeps the activity table's
              independent scroll. */}
          <div
            className="flex-shrink-0 overflow-hidden h-[calc(100vh-0.625rem)] lg:h-[calc(100vh-var(--header-height)-2.875rem)]"
            style={
              bottomPanelH !== undefined
                ? { height: `${bottomPanelH}px` }
                : undefined
            }
          >
            <BottomDataPanel chain={chain} address={address} />
          </div>
        </div>

        {/* Right sidebar — outer `<aside>` is just a relative positioning
            slot (no border / background); the actual content lives in an
            absolutely-positioned panel anchored to the top of the aside,
            sized by its own content (`h-fit`). This mirrors GMGN's
            `relative > absolute top-0 h-fit` pattern.
            
            Why absolute + h-fit:
              - The aside box is stretched by flex `align-items: stretch` to
                the inner-row height, which equals the LEFT column's natural
                height (header + chart + handle + bottom panel ≈ 1.4× viewport).
              - If the sidebar content sat in normal flow, its background /
                border would extend down to that stretched height, leaving a
                visible empty gap below the last card whenever the LEFT
                column is taller than the sidebar content.
              - Pulling the content into an absolute panel detaches it from
                the aside's box height, so the panel's `h-fit` size matches
                its own content. Border + background travel with the panel.
              - The aside box itself has no visible chrome, so the area
                below the panel blends into the main background — no gap. */}
        <aside className="relative hidden w-[320px] min-w-[320px] max-w-[320px] flex-shrink-0 md:block">
          <div
            ref={sidebarPanelRef}
            className="custom-scrollbar absolute inset-x-0 top-0 flex h-fit flex-col border-l border-default-100"
          >
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
          </div>
        </aside>
      </div>
    </div>
  );
}

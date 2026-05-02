"use client";

import { useCallback, useRef, useState } from "react";
import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";
import { TradingChart } from "@liberfi/ui-dex/components/trade";
import type { Chain } from "@liberfi.io/types";
import { TokenDetailHeader } from "./TokenDetailHeader";
import { SidebarVolumeStats } from "./SidebarVolumeStats";
import { TradingPanel } from "./TradingPanel";
import { TokenInfoPanel } from "./TokenInfoPanel";
import { BottomDataPanel } from "./BottomDataPanel";

const MIN_BOTTOM_H = 80;
const DEFAULT_BOTTOM_H = 200;

export interface AxiomTradePageProps {
  chain: Chain;
  address: string;
}

export function AxiomTradePage({ chain, address }: AxiomTradePageProps) {
  useHideHeader("tablet");
  useHideBottomNavigationBar();

  const [bottomH, setBottomH] = useState(DEFAULT_BOTTOM_H);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newBottom = containerRect.bottom - e.clientY;
    const clamped = Math.max(MIN_BOTTOM_H, Math.min(newBottom, containerRect.height - 200));
    setBottomH(clamped);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-0.625rem)] md:h-[calc(100vh-0.625rem)] lg:h-[calc(100vh-var(--header-height)-2.875rem)] flex flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Left: header + chart + split + bottom */}
        <div ref={containerRef} className="flex-1 flex flex-col min-w-0">
          <TokenDetailHeader chain={chain} address={address} />

          {/* Chart toolbar + chart */}
          <ChartToolbar />
          <div className="flex-1 min-h-0">
            <TradingChart />
          </div>

          {/* Horizontal split handle */}
          <div className="group relative flex h-px w-full items-center justify-center flex-none select-none">
            <div
              className="absolute inset-0 -top-[3px] -bottom-[3px] cursor-ns-resize z-10"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
            <div className="h-px w-full bg-border-subtle group-hover:bg-zinc-600 transition-colors" />
          </div>

          {/* Resizable bottom panel */}
          <div style={{ height: bottomH }} className="flex-none overflow-hidden">
            <BottomDataPanel chain={chain} address={address} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden md:flex w-[320px] min-w-[320px] max-w-[320px] h-full flex-col overflow-y-auto custom-scrollbar border-l border-border-subtle">
          <SidebarVolumeStats chain={chain} address={address} />
          <TradingPanel />
          <TokenInfoPanel chain={chain} address={address} />
          <SimilarTokensPanel />
        </div>
      </div>
    </div>
  );
}

function SimilarTokensPanel() {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-col gap-0">
        <div className="h-px w-full bg-border-subtle" />
        <div className="flex w-full shrink-0 flex-row gap-4 px-4 pl-2 pt-1.5">
          <button className="group flex h-7 w-fit flex-row items-center justify-start rounded pl-2 pr-1 text-sm font-medium text-[rgb(200,201,209)] hover:bg-neutral-800/50 transition-colors">
            Similar Tokens
            <svg className="ml-1 h-3 w-3 text-[rgb(119,122,140)] transition-transform group-hover:rotate-180" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-xs text-[rgb(119,122,140)] self-center">MC</span>
        </div>
        <div className="flex flex-col gap-0 overflow-y-auto px-4 pb-6 pt-2" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
          {/* Placeholder for similar tokens list */}
        </div>
      </div>
    </div>
  );
}

function ChartToolbar() {
  const [priceMode, setPriceMode] = useState<"USD" | "SOL">("USD");
  const [chartMode, setChartMode] = useState<"MarketCap" | "Price">("Price");

  return (
    <div className="flex-none flex items-center h-[32px] px-3 gap-2 border-b border-border-subtle text-xs">
      <button className="px-2 h-6 text-neutral hover:text-foreground transition-colors">
        Indicators
      </button>
      <span className="w-px h-3.5 bg-neutral-700" />
      <button className="px-2 h-6 text-neutral hover:text-foreground transition-colors">
        Display Options
      </button>
      <button className="px-2 h-6 text-neutral hover:text-foreground transition-colors">
        Hide All Bubbles
      </button>
      <span className="w-px h-3.5 bg-neutral-700" />
      <button
        onClick={() => setPriceMode(priceMode === "USD" ? "SOL" : "USD")}
        className="h-6 px-2.5 rounded bg-content2 text-foreground hover:bg-content3 transition-colors font-medium"
      >
        {priceMode}/{priceMode === "USD" ? "SOL" : "USD"}
      </button>
      <button
        onClick={() => setChartMode(chartMode === "Price" ? "MarketCap" : "Price")}
        className="h-6 px-2.5 rounded bg-content2 text-foreground hover:bg-content3 transition-colors font-medium"
      >
        {chartMode}/{chartMode === "Price" ? "MarketCap" : "Price"}
      </button>
    </div>
  );
}

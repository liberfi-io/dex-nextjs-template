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

const MIN_BOTTOM_H = 80;
const DEFAULT_BOTTOM_H = 240;

export interface AxiomTradePageProps {
  chain: Chain;
  address: string;
}

/**
 * Desktop / tablet token trade page. Dispatches to the mobile variant via
 * `useScreen().isMobile`. Composition-only: each sub-block is a
 * `@liberfi.io/ui-tokens` widget or a `@liberfi.io/ui-scaffold` primitive;
 * this shell just owns layout (grid + split-handle state).
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
  const [bottomH, setBottomH] = useState(DEFAULT_BOTTOM_H);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ h: number } | null>(null);

  const { data: token } = useTokenQuery({ chain, address });
  const tokenSymbol = token?.symbol;

  const handleDragStart = useCallback(() => {
    startRef.current = { h: bottomH };
  }, [bottomH]);

  const handleDrag = useCallback((delta: number) => {
    if (!containerRef.current) return;
    const containerH = containerRef.current.getBoundingClientRect().height;
    setBottomH((prev) => {
      const next = prev - delta;
      return Math.max(MIN_BOTTOM_H, Math.min(next, containerH - 200));
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    startRef.current = null;
  }, []);

  return (
    <div className="relative flex h-[calc(100vh-0.625rem)] w-full flex-col overflow-hidden md:h-[calc(100vh-0.625rem)] lg:h-[calc(100vh-var(--header-height)-2.875rem)]">
      <div className="flex min-h-0 flex-1">
        {/* Left column */}
        <div ref={containerRef} className="flex min-w-0 flex-1 flex-col">
          <TokenDetailHeader chain={chain} address={address} />

          {/* TradingView occupies the remaining vertical space */}
          <div className="min-h-0 flex-1">
            <TradingChart />
          </div>

          {/* Splitter between chart and bottom data panel */}
          <AxiomSplitHandle
            orientation="horizontal"
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />

          {/* Resizable bottom data panel */}
          <div
            style={{ height: bottomH }}
            className="flex-none overflow-hidden"
          >
            <BottomDataPanel chain={chain} address={address} />
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="custom-scrollbar hidden h-full w-[320px] min-w-[320px] max-w-[320px] flex-col overflow-y-auto border-l border-default-100 md:flex">
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

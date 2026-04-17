"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePositionsMulti } from "@liberfi.io/react-predict";
import { usePredictWallet } from "@liberfi.io/ui-predict";
import {
  ChartLineIcon,
  KalshiIcon,
  PolymarketIcon,
  UsdcIcon,
  useScreen,
} from "@liberfi.io/ui";

function toCents(amount: number): number {
  return Math.floor(amount * 100);
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdc(amount: number): string {
  return formatCents(toCents(amount));
}

function BalanceBreakdownContent({
  polymarketUsdcBalance,
  kalshiUsdcBalance,
  positionsCents,
  portfolioTotalCents,
  initialLoading,
}: {
  polymarketUsdcBalance: number | null;
  kalshiUsdcBalance: number | null;
  positionsCents: number;
  portfolioTotalCents: number;
  initialLoading: boolean;
}) {
  return (
    <>
      <div className="p-2">
        <div className="text-[11px] uppercase tracking-[0.05em] text-zinc-500 font-medium px-3 pt-1 pb-2">
          Cash Breakdown
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            <PolymarketIcon width={20} height={20} />
            <span className="text-sm text-zinc-400">Polymarket</span>
          </div>
          <span className="text-sm font-medium text-zinc-100 tabular-nums">
            {polymarketUsdcBalance != null
              ? `$${formatUsdc(polymarketUsdcBalance)}`
              : initialLoading
                ? "..."
                : "$0.00"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            <KalshiIcon width={20} height={20} />
            <span className="text-sm text-zinc-400">Kalshi</span>
          </div>
          <span className="text-sm font-medium text-zinc-100 tabular-nums">
            {kalshiUsdcBalance != null
              ? `$${formatUsdc(kalshiUsdcBalance)}`
              : initialLoading
                ? "..."
                : "$0.00"}
          </span>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(39,39,42,1)" }} className="p-2">
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            <ChartLineIcon width={20} height={20} className="text-bullish" />
            <span className="text-sm text-zinc-400">Positions</span>
          </div>
          <span className="text-sm font-medium text-zinc-100 tabular-nums">
            ${formatCents(positionsCents)}
          </span>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(39,39,42,1)" }} className="p-2">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="text-sm text-zinc-300 font-medium">Portfolio Total</span>
          <span className="text-sm font-bold text-[#c7ff2e] tabular-nums">
            {initialLoading ? "..." : `$${formatCents(portfolioTotalCents)}`}
          </span>
        </div>
      </div>
    </>
  );
}

export function PredictBalanceIndicator() {
  const {
    kalshiUsdcBalance,
    polymarketUsdcBalance,
    solanaAddress,
    evmAddress,
    isLoading: balanceLoading,
  } = usePredictWallet();
  const { isMobile } = useScreen();

  const { data: positionsData } = usePositionsMulti({
    kalshi_user: solanaAddress || undefined,
    polymarket_user: evmAddress || undefined,
  });

  const cashKalshiCents = toCents(kalshiUsdcBalance ?? 0);
  const cashPolymarketCents = toCents(polymarketUsdcBalance ?? 0);
  const cashTotalCents = cashKalshiCents + cashPolymarketCents;

  const positionsCents = useMemo(() => {
    const all = positionsData?.positions ?? [];
    let total = 0;
    for (const p of all) {
      total += p.current_value ?? p.size * (p.current_price ?? 0);
    }
    return toCents(total);
  }, [positionsData]);

  const portfolioTotalCents = cashTotalCents + positionsCents;

  const initialLoading =
    balanceLoading &&
    kalshiUsdcBalance === null &&
    polymarketUsdcBalance === null;

  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  }, [isMobile]);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const breakdownProps = {
    polymarketUsdcBalance,
    kalshiUsdcBalance,
    positionsCents,
    portfolioTotalCents,
    initialLoading,
  };

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tablet & Mobile: USDC icon + total balance */}
      <button
        type="button"
        onClick={handleClick}
        className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 rounded-[10px] transition-colors cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <UsdcIcon width={16} height={16} aria-hidden="true" />
        <span className="text-xs font-medium text-zinc-100 tabular-nums">
          {initialLoading ? "..." : `$${formatCents(portfolioTotalCents)}`}
        </span>
      </button>

      {/* Desktop: full breakdown */}
      <button
        type="button"
        onClick={handleClick}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 rounded-[10px] transition-colors cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <div className="flex items-center gap-1.5" title="Cash Balance">
          <UsdcIcon width={16} height={16} aria-hidden="true" />
          <span className="text-xs font-medium text-zinc-100 tabular-nums">
            {initialLoading ? "..." : `$${formatCents(cashTotalCents)}`}
          </span>
        </div>
        <div className="w-px h-4 bg-zinc-700/40" />
        <div className="flex items-center gap-1.5" title="Positions Value">
          <ChartLineIcon
            width={16}
            height={16}
            className="text-bullish"
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-zinc-100 tabular-nums">
            ${formatCents(positionsCents)}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Mobile: bottom sheet */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-sm mb-safe animate-in slide-in-from-bottom duration-200"
            style={{
              borderRadius: "14px 14px 0 0",
              border: "1px solid rgba(39,39,42,1)",
              borderBottom: "none",
              background: "rgba(24,24,27,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-700" />
            </div>
            <BalanceBreakdownContent {...breakdownProps} />
            <div className="pb-safe" />
          </div>
        </div>
      )}

      {/* Tablet & Desktop: popover */}
      {!isMobile && isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 z-50 overflow-hidden"
          style={{
            borderRadius: 14,
            border: "1px solid rgba(39,39,42,1)",
            background: "rgba(24,24,27,1)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
        >
          <BalanceBreakdownContent {...breakdownProps} />
        </div>
      )}
    </div>
  );
}

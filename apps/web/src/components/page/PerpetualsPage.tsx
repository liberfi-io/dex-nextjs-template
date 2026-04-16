"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CoinInfoWidget,
  SearchCoinsWidget,
  OrderBookWidget,
  TradesWidget,
  PlaceOrderFormWidget,
  PositionsWidget,
  OpenOrdersWidget,
  TradeHistoryWidget,
  usePerpetualsClient,
  useMarketsQuery,
} from "@liberfi.io/ui-perpetuals";
import { cn, useScreen } from "@liberfi.io/ui";
import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";
import {
  TvChart,
  type TvChartInstance,
  type TvChartProps,
} from "@liberfi/ui-dex/components/tvchart/TvChart";
import {
  TvChartKlineStyle,
  TvChartLayout,
  TvChartTheme,
  TvChartType,
} from "@liberfi/ui-dex/libs/tvchart";
import { getTvChartLibraryLocale } from "@liberfi/ui-dex/libs/tvchart/utils";
import { useTranslation } from "@liberfi/ui-base";
import type { Timezone } from "../../../public/static/charting_library";
import { PerpetualsTvChartDataFeedModule } from "./perpetuals/PerpetualsTvChartDataFeedModule";

type BottomTab = "positions" | "openOrders" | "tradeHistory";
type MiddleTab = "orderBook" | "trades";
type MobileMainTab = "chart" | "orderBook" | "trades";

const TICKER_COINS = ["BTC", "ETH", "SOL"];

const BOTTOM_PANEL_MIN = 80;
const BOTTOM_PANEL_MAX = 500;
const BOTTOM_PANEL_DEFAULT = 200;

export function PerpetualsPage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();

  const { isMobile } = useScreen();

  const [symbol, setSymbol] = useState("BTC-USDC");
  const [activeTab, setActiveTab] = useState<BottomTab>("positions");
  const [middleTab, setMiddleTab] = useState<MiddleTab>("orderBook");
  const [showSearch, setShowSearch] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(BOTTOM_PANEL_DEFAULT);

  const [mobileMainTab, setMobileMainTab] = useState<MobileMainTab>("chart");
  const [showMobileOrder, setShowMobileOrder] = useState(false);

  const { client } = usePerpetualsClient();

  useEffect(() => {
    PerpetualsTvChartDataFeedModule.setClient(client);
  }, [client]);

  const handleSelectCoin = useCallback((selected: string) => {
    setSymbol(selected);
    setShowSearch(false);
  }, []);

  const tokenSymbol = symbol.split("-")[0];

  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-full min-h-0 text-white overflow-hidden" style={{ backgroundColor: '#000000' }}>
        {/* Ticker strip */}
        <TickerStrip
          activeSymbol={tokenSymbol}
          onSelectCoin={(coin) => setSymbol(`${coin}-USDC`)}
        />

        {/* Compact coin selector + info */}
        <CoinSelectorBar
          tokenSymbol={tokenSymbol}
          symbol={symbol}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          handleSelectCoin={handleSelectCoin}
          isMobile
        />

        {/* Mobile tab bar: Chart | Order Book | Trades */}
        <MobileTabBar activeTab={mobileMainTab} onTabChange={setMobileMainTab} />

        {/* Content area — flex col fills remaining space */}
        <div className="flex-1 min-h-0 flex flex-col">
          {mobileMainTab === "chart" && (
            <>
              {/* Chart takes ~60% of available height */}
              <div className="flex-[3] min-h-[200px] flex flex-col" style={{ borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
                <PerpetualsChart symbol={symbol} />
              </div>

              {/* Positions / Orders / History tab bar */}
              <div className="flex-none flex items-center" style={{ height: 36, padding: '0 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
                {(
                  [
                    { key: "positions", label: "Positions" },
                    { key: "openOrders", label: "Open Orders" },
                    { key: "tradeHistory", label: "Trades" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="cursor-pointer transition-colors"
                    style={{
                      padding: '0 8px',
                      height: 36,
                      fontSize: 13,
                      fontWeight: 500,
                      color: activeTab === tab.key ? '#ffffff' : '#6b6b6b',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.key ? '2px solid #ffffff' : '2px solid transparent',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Positions content — fills remaining ~40% */}
              <div className="flex-[2] min-h-0 overflow-auto" style={{ backgroundColor: '#000000' }}>
                {activeTab === "positions" && <PositionsWidget symbol={symbol} />}
                {activeTab === "openOrders" && <OpenOrdersWidget symbol={symbol} />}
                {activeTab === "tradeHistory" && (
                  <TradeHistoryWidget symbol={symbol} initialTimeRange="7d" pageSize={50} />
                )}
              </div>
            </>
          )}

          {mobileMainTab === "orderBook" && (
            <div className="flex-1 min-h-0 overflow-auto">
              <OrderBookWidget symbol={symbol} className="h-full" />
            </div>
          )}

          {mobileMainTab === "trades" && (
            <div className="flex-1 min-h-0 overflow-auto">
              <TradesWidget symbol={symbol} limit={50} className="h-full" />
            </div>
          )}
        </div>

        {/* Sticky bottom: Long / Short buttons */}
        <div className="flex-none flex" style={{ padding: '8px 12px', gap: 8, borderTop: '1px solid rgba(39,39,42,0.6)', backgroundColor: '#000000' }}>
          <button
            type="button"
            className="flex-1 cursor-pointer transition-colors"
            style={{
              height: 44,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 9999,
              backgroundColor: '#C7FF2E',
              color: '#000000',
              border: 'none',
            }}
            onClick={() => setShowMobileOrder(true)}
          >
            Long
          </button>
          <button
            type="button"
            className="flex-1 cursor-pointer transition-colors"
            style={{
              height: 44,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 9999,
              backgroundColor: '#F76816',
              color: '#000000',
              border: 'none',
            }}
            onClick={() => setShowMobileOrder(true)}
          >
            Short
          </button>
        </div>

        {/* Mobile place order bottom sheet */}
        {showMobileOrder && (
          <MobilePlaceOrderSheet
            symbol={symbol}
            onClose={() => setShowMobileOrder(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 text-white overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Ticker strip */}
      <TickerStrip
        activeSymbol={tokenSymbol}
        onSelectCoin={(coin) => setSymbol(`${coin}-USDC`)}
      />

      {/* Coin selector + CoinInfo stats */}
      <CoinSelectorBar
        tokenSymbol={tokenSymbol}
        symbol={symbol}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        handleSelectCoin={handleSelectCoin}
      />

      {/* Main content: Left (chart+OB / split / positions) | Right (PlaceOrder) */}
      <div className="flex-1 min-h-0 flex">
        {/* Left: split view — top (Chart + OB side by side) | handle | bottom (Positions) */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top half: Chart + OB/Trades side by side */}
          <div className="flex-1 min-h-0 flex">
            {/* Chart */}
            <div className="flex-1 min-w-0 flex flex-col" style={{ borderRight: '1px solid rgba(39,39,42,0.6)' }}>
              <PerpetualsChart symbol={symbol} />
            </div>

            {/* OB / Trades */}
            <div className="flex flex-col overflow-hidden" style={{ width: 290, minWidth: 290 }}>
              <div className="flex-none flex items-center" style={{ height: 36, padding: '0 16px 0 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
                {(
                  [
                    { key: "orderBook", label: "Order Book" },
                    { key: "trades", label: "Trades" },
                  ] as const
                ).map((tab) => (
                  <div
                    key={tab.key}
                    style={{
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: middleTab === tab.key ? '2px solid #ffffff' : '2px solid transparent',
                      padding: '2px 0 0',
                      cursor: 'pointer',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setMiddleTab(tab.key)}
                      className="cursor-pointer transition-colors"
                      style={{
                        padding: '0 8px',
                        fontSize: 14,
                        fontWeight: 500,
                        color: middleTab === tab.key ? '#ffffff' : '#b5b5b5',
                        background: 'none',
                        border: 'none',
                      }}
                    >
                      {tab.label}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {middleTab === "orderBook" ? (
                  <OrderBookWidget symbol={symbol} className="h-full" />
                ) : (
                  <TradesWidget symbol={symbol} limit={50} className="h-full" />
                )}
              </div>
            </div>
          </div>

          {/* Draggable split handle */}
          <SplitHandle onResize={setBottomHeight} currentHeight={bottomHeight} />

          {/* Bottom half: Positions / Open Orders / Trades */}
          <div className="flex-none flex flex-col" style={{ height: bottomHeight }}>
            <div className="flex-none flex items-center" style={{ height: 36, padding: '0 16px 0 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
              {(
                [
                  { key: "positions", label: "Positions" },
                  { key: "openOrders", label: "Open Orders" },
                  { key: "tradeHistory", label: "Trades" },
                ] as const
              ).map((tab) => (
                <div
                  key={tab.key}
                  style={{
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: activeTab === tab.key ? '2px solid #ffffff' : '2px solid transparent',
                    padding: '2px 0 0',
                    cursor: 'pointer',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="cursor-pointer transition-colors"
                    style={{
                      padding: '0 8px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: activeTab === tab.key ? '#ffffff' : '#b5b5b5',
                      background: 'none',
                      border: 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-auto" style={{ backgroundColor: '#000000' }}>
              {activeTab === "positions" && <PositionsWidget symbol={symbol} />}
              {activeTab === "openOrders" && <OpenOrdersWidget symbol={symbol} />}
              {activeTab === "tradeHistory" && (
                <TradeHistoryWidget symbol={symbol} initialTimeRange="7d" pageSize={50} />
              )}
            </div>
          </div>
        </div>

        {/* Right: PlaceOrder (full height, fixed 320px) */}
        <div className="flex flex-col overflow-hidden" style={{ width: 320, minWidth: 320, maxWidth: 320, borderLeft: '1px solid rgba(39,39,42,0.6)' }}>
          <PlaceOrderFormWidget symbol={symbol} className="h-full" />
        </div>
      </div>

    </div>
  );
}

/** Coin selector bar — shared between mobile and desktop */
function CoinSelectorBar({
  tokenSymbol,
  symbol,
  showSearch,
  setShowSearch,
  handleSelectCoin,
  isMobile,
}: {
  tokenSymbol: string;
  symbol: string;
  showSearch: boolean;
  setShowSearch: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleSelectCoin: (s: string) => void;
  isMobile?: boolean;
}) {
  return (
    <div className="flex-none relative" style={{ height: isMobile ? 48 : 64, borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
      <div className="flex items-center h-full">
        <button
          type="button"
          className="flex items-center cursor-pointer shrink-0"
          style={{ gap: 6, padding: isMobile ? '0 10px' : '0 16px', height: 32 }}
          onClick={() => setShowSearch((v: boolean) => !v)}
        >
          <img
            src={`https://app.hyperliquid.xyz/coins/${tokenSymbol}.svg`}
            alt={tokenSymbol}
            className="rounded-full"
            style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 500, color: '#ffffff' }}>{tokenSymbol}</span>
          <svg
            className={cn("transition-transform", showSearch && "rotate-180")}
            style={{ color: '#b5b5b5', width: 12, height: 12 }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0 overflow-x-auto">
          <CoinInfoWidget symbol={symbol} />
        </div>
      </div>

      {showSearch && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSearch(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close search"
          />
          <div
            className="absolute top-full left-0 z-50 flex flex-col overflow-hidden shadow-2xl"
            style={{
              width: isMobile ? '100vw' : 800,
              height: isMobile ? '60vh' : 400,
              backgroundColor: 'rgba(24,24,27,1)',
              border: '1px solid rgba(39,39,42,0.6)',
              borderRadius: isMobile ? 0 : 14,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <SearchCoinsWidget onSelectCoin={handleSelectCoin} />
          </div>
        </>
      )}
    </div>
  );
}

/** Mobile main tab bar: Chart | Order Book | Trades */
function MobileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: MobileMainTab;
  onTabChange: (tab: MobileMainTab) => void;
}) {
  const tabs: { key: MobileMainTab; label: string }[] = [
    { key: "chart", label: "Chart" },
    { key: "orderBook", label: "Order Book" },
    { key: "trades", label: "Trades" },
  ];

  return (
    <div className="flex-none flex items-center" style={{ padding: '4px 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
      <div
        className="relative flex w-full items-center rounded-full"
        style={{ height: 32, backgroundColor: 'rgba(26,26,26,0.5)', padding: 2 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className="flex-1 flex items-center justify-center cursor-pointer transition-colors rounded-full"
            style={{
              height: 28,
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#ffffff' : '#6b6b6b',
              backgroundColor: activeTab === tab.key ? '#2a2a2a' : 'transparent',
              border: 'none',
            }}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mobile place order bottom sheet */
function MobilePlaceOrderSheet({
  symbol,
  onClose,
}: {
  symbol: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />
      <div
        className="relative z-10 flex flex-col overflow-hidden"
        style={{
          maxHeight: '85vh',
          backgroundColor: '#000000',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTop: '1px solid rgba(39,39,42,0.6)',
        }}
      >
        {/* Drag indicator */}
        <div className="flex justify-center" style={{ padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#2a2a2a' }} />
        </div>

        {/* Close button */}
        <div className="flex justify-end" style={{ padding: '0 12px' }}>
          <button
            type="button"
            className="cursor-pointer"
            style={{ color: '#6b6b6b', background: 'none', border: 'none', padding: 4 }}
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <PlaceOrderFormWidget symbol={symbol} />
        </div>
      </div>
    </div>
  );
}

/** Draggable horizontal split handle between chart and bottom panel */
function SplitHandle({
  onResize,
  currentHeight,
}: {
  onResize: (height: number) => void;
  currentHeight: number;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startY.current = e.clientY;
      startHeight.current = currentHeight;

      const handleMouseMove = (ev: MouseEvent) => {
        const delta = startY.current - ev.clientY;
        const next = Math.max(
          BOTTOM_PANEL_MIN,
          Math.min(BOTTOM_PANEL_MAX, startHeight.current + delta),
        );
        onResize(next);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [currentHeight, onResize],
  );

  return (
    <div className="perp-split-handle relative flex-none">
      <div
        className="perp-split-bar flex items-center justify-center w-full cursor-ns-resize flex-row transition-colors duration-150 ease-in-out"
        style={{
          height: 4,
          gap: 4,
          backgroundColor: isResizing ? '#464646' : 'rgba(26,26,26,0.8)',
        }}
      >
        <i style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: '#6b6b6b' }} />
        <i style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: '#6b6b6b' }} />
        <i style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: '#6b6b6b' }} />

        {/* Expanded hit area */}
        <div
          className="absolute inset-0 cursor-ns-resize"
          style={{ top: -6, bottom: -6 }}
          onMouseDown={handleMouseDown}
        />
      </div>

      <style>{`
        .perp-split-handle:hover .perp-split-bar { background-color: #464646 !important; }
      `}</style>

      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-ns-resize" />
      )}
    </div>
  );
}

/** Horizontal ticker strip showing popular coins with 24h change */
function TickerStrip({
  activeSymbol,
  onSelectCoin,
}: {
  activeSymbol: string;
  onSelectCoin: (coin: string) => void;
}) {
  const { data: markets } = useMarketsQuery({});

  const tickerData = useMemo(() => {
    if (!markets) return TICKER_COINS.map((c) => ({ coin: c, change: 0 }));
    return TICKER_COINS.map((coin) => {
      const market = markets.find(
        (m) => m.symbol === `${coin}-USDC` || m.symbol === `${coin}-USD`,
      );
      const change = market?.change24h ?? 0;
      return { coin, change };
    });
  }, [markets]);

  return (
    <div className="flex-none flex items-center overflow-x-auto" style={{ height: 28, gap: 16, padding: '0 12px', borderBottom: '1px solid rgba(39,39,42,0.6)', backgroundColor: '#0a0a0b' }}>
      {tickerData.map(({ coin, change }) => {
        const isPositive = change >= 0;
        const changeStr = `${isPositive ? "+" : ""}${change.toFixed(2)}%`;
        return (
          <button
            key={coin}
            type="button"
            onClick={() => onSelectCoin(coin)}
            className="flex items-center cursor-pointer transition-colors"
            style={{
              gap: 4,
              padding: '2px 4px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              color: '#b5b5b5',
              backgroundColor: activeSymbol === coin ? 'rgba(255,255,255,0.05)' : 'transparent',
              border: 'none',
            }}
          >
            <img
              src={`https://app.hyperliquid.xyz/coins/${coin}.svg`}
              alt={coin}
              className="w-4 h-4 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span>{coin}</span>
            <span style={{ color: isPositive ? '#C7FF2E' : '#F76816' }}>
              {changeStr}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const PerpetualsChart = memo(function PerpetualsChart({ symbol }: { symbol: string }) {
  const { i18n } = useTranslation();
  const chartRef = useRef<TvChartInstance>(null);
  const [chartReady, setChartReady] = useState(false);

  const config = useMemo<TvChartProps["config"]>(
    () => ({
      storageId: "perps-kline",
      tickerSymbol: symbol,
      resolution: "1m",
      datafeedModule: PerpetualsTvChartDataFeedModule,
      theme: TvChartTheme.Dark,
      layout: TvChartLayout.Layout1A,
      chartType: TvChartType.TradingView,
      kLineStyle: TvChartKlineStyle.Candles,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as unknown as Timezone,
      locale: getTvChartLibraryLocale(i18n.language),
      chartNames: {
        [TvChartType.TradingView]: "TradingView",
        [TvChartType.Original]: "Original",
      },
    }),
    [symbol, i18n.language],
  );

  useEffect(() => {
    if (chartReady) {
      chartRef.current?.setSymbol(symbol);
    }
  }, [chartReady, symbol]);

  const handleChartReady = useCallback(() => {
    setChartReady(true);
  }, []);

  return (
    <div className="flex-1 w-full min-h-0 flex flex-col">
      <TvChart ref={chartRef} config={config} onChartReady={handleChartReady} />
    </div>
  );
});

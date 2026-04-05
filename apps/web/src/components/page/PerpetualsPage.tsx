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
import { cn } from "@liberfi.io/ui";
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

const TICKER_COINS = ["BTC", "ETH", "SOL"];

const BOTTOM_PANEL_MIN = 80;
const BOTTOM_PANEL_MAX = 500;
const BOTTOM_PANEL_DEFAULT = 200;

export function PerpetualsPage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();

  const [symbol, setSymbol] = useState("BTC-USDC");
  const [activeTab, setActiveTab] = useState<BottomTab>("positions");
  const [middleTab, setMiddleTab] = useState<MiddleTab>("orderBook");
  const [showSearch, setShowSearch] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(BOTTOM_PANEL_DEFAULT);

  const { client } = usePerpetualsClient();

  useEffect(() => {
    PerpetualsTvChartDataFeedModule.setClient(client);
  }, [client]);

  const handleSelectCoin = useCallback((selected: string) => {
    setSymbol(selected);
    setShowSearch(false);
  }, []);

  const tokenSymbol = symbol.split("-")[0];

  return (
    <div className="flex flex-col w-full h-full min-h-0 text-white overflow-hidden" style={{ backgroundColor: '#06070b' }}>
      {/* Ticker strip */}
      <TickerStrip
        activeSymbol={tokenSymbol}
        onSelectCoin={(coin) => setSymbol(`${coin}-USDC`)}
      />

      {/* Coin selector + CoinInfo stats */}
      <div className="flex-none relative" style={{ height: 64, borderBottom: '1px solid #22242d' }}>
        <div className="flex items-center" style={{ height: 64 }}>
          <button
            type="button"
            className="flex items-center cursor-pointer"
            style={{
              gap: 8,
              padding: '0 16px',
              height: 32,
            }}
            onClick={() => setShowSearch((v) => !v)}
          >
            <img
              src={`https://app.hyperliquid.xyz/coins/${tokenSymbol}.svg`}
              alt={tokenSymbol}
              className="rounded-full"
              style={{ width: 32, height: 32 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 500, lineHeight: '23px', letterSpacing: '-0.36px', color: '#fcfcfc' }}>{tokenSymbol}</span>
            <svg
              className={cn(
                "transition-transform",
                showSearch && "rotate-180",
              )}
              style={{ color: '#c8c9d1', width: 12, height: 12 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
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
              className="absolute top-full left-0 z-50 overflow-hidden shadow-2xl"
              style={{
                width: 800,
                maxHeight: 400,
                backgroundColor: '#18181a',
                border: '1px solid #323542',
                borderRadius: 4,
              }}
            >
              <SearchCoinsWidget onSelectCoin={handleSelectCoin} />
            </div>
          </>
        )}
      </div>

      {/* Main content: Left (chart+OB / split / positions) | Right (PlaceOrder) */}
      <div className="flex-1 min-h-0 flex">
        {/* Left: split view — top (Chart + OB side by side) | handle | bottom (Positions) */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top half: Chart + OB/Trades side by side */}
          <div className="flex-1 min-h-0 flex">
            {/* Chart */}
            <div className="flex-1 min-w-0 flex flex-col" style={{ borderRight: '1px solid #22242d' }}>
              <PerpetualsChart symbol={symbol} />
            </div>

            {/* OB / Trades */}
            <div className="flex flex-col overflow-hidden" style={{ width: 290, minWidth: 290 }}>
              <div className="flex-none flex items-center" style={{ height: 36, padding: '0 16px 0 8px', borderBottom: '1px solid #22242d' }}>
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
                      borderBottom: middleTab === tab.key ? '2px solid #fcfcfc' : '2px solid transparent',
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
                        color: middleTab === tab.key ? '#fcfcfc' : '#c8c9d1',
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
            <div className="flex-none flex items-center" style={{ height: 36, padding: '0 16px 0 8px', borderBottom: '1px solid #22242d' }}>
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
                    borderBottom: activeTab === tab.key ? '2px solid #fcfcfc' : '2px solid transparent',
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
                      color: activeTab === tab.key ? '#fcfcfc' : '#c8c9d1',
                      background: 'none',
                      border: 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-auto" style={{ backgroundColor: '#06070b' }}>
              {activeTab === "positions" && <PositionsWidget symbol={symbol} />}
              {activeTab === "openOrders" && <OpenOrdersWidget symbol={symbol} />}
              {activeTab === "tradeHistory" && (
                <TradeHistoryWidget symbol={symbol} initialTimeRange="7d" pageSize={50} />
              )}
            </div>
          </div>
        </div>

        {/* Right: PlaceOrder (full height, fixed 320px) */}
        <div className="flex flex-col overflow-hidden" style={{ width: 320, minWidth: 320, maxWidth: 320, borderLeft: '1px solid #22242d' }}>
          <PlaceOrderFormWidget symbol={symbol} className="h-full" />
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
          backgroundColor: isResizing ? '#5B6075' : 'rgba(34,36,45,0.8)',
        }}
      >
        <i style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: '#777a8c' }} />
        <i style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: '#777a8c' }} />
        <i style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: '#777a8c' }} />

        {/* Expanded hit area */}
        <div
          className="absolute inset-0 cursor-ns-resize"
          style={{ top: -6, bottom: -6 }}
          onMouseDown={handleMouseDown}
        />
      </div>

      <style>{`
        .perp-split-handle:hover .perp-split-bar { background-color: #5B6075 !important; }
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
    <div className="flex-none flex items-center overflow-x-auto" style={{ height: 28, gap: 16, padding: '0 12px', borderBottom: '1px solid #22242d', backgroundColor: '#101114' }}>
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
              color: '#c8c9d1',
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
            <span style={{ color: isPositive ? '#2fe3ac' : '#ec397a' }}>
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

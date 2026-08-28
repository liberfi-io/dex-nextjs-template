"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  useOrdersQuery,
  useUniverseQuery,
  type UniverseSnapshot,
} from "@liberfi.io/ui-perpetuals";
import { cn, useScreen } from "@liberfi.io/ui";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import {
  useAuthCallback,
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";
import { useHideBottomNavigationBar, useHideHeader } from "../../application/layout-chrome";
import { useTranslation } from "@liberfi.io/i18n";
import { DEPOSIT_HL_USDC_MODAL_ID } from "../modals/DepositHyperliquidUsdcModal";
import { useHyperliquidUpdateLeverage } from "../../hooks/useHyperliquidUpdateLeverage";
import { useHyperliquidPlaceOrder } from "../../hooks/useHyperliquidPlaceOrder";
import { useHyperliquidCancelOrder } from "../../hooks/useHyperliquidCancelOrder";
import { PerpetualsChart } from "./perpetuals/PerpetualsChart";

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

  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const [symbol, setSymbol] = useState("BTC-USDC");
  const [activeTab, setActiveTab] = useState<BottomTab>("positions");
  const [middleTab, setMiddleTab] = useState<MiddleTab>("orderBook");
  const [showSearch, setShowSearch] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(BOTTOM_PANEL_DEFAULT);

  const [mobileMainTab, setMobileMainTab] = useState<MobileMainTab>("chart");
  const [showMobileOrder, setShowMobileOrder] = useState(false);

  const { client } = usePerpetualsClient();

  // EVM wallet address used by every account-scoped widget on this page
  // (PlaceOrderForm, Positions, OpenOrders, TradeHistory). Without this
  // the widgets stay in their loading / empty states because their
  // queries are gated on `!!userAddress`. We resolve it the same way
  // `useHyperliquidUpdateLeverage` does — find the connected EVM
  // adapter and surface its address.
  const wallets = useWallets();
  const userAddress = useMemo(() => {
    const evm = wallets.find(
      (w) => w.chainNamespace === "EVM" && w.isConnected,
    ) as EvmWalletAdapter | undefined;
    return evm?.address;
  }, [wallets]);

  // Wires the "Add More Funds" button inside the order form to the
  // SOL → Hyperliquid USDC deposit dialog. The button is hidden when no
  // handler is provided (see PlaceOrderFormUI).
  //
  // Guarded by `useAuthCallback` from the SDK: when the user is
  // signed-out the wrapper triggers Privy `signIn()` (fire-and-forget,
  // returns `undefined`) and the deposit modal is *not* opened on this
  // click. Once auth completes the page re-renders with a connected
  // wallet, the form's submit-state machine still resolves to
  // "Add More Funds" (balance is 0 immediately after login), and the
  // user clicks again to actually open the deposit dialog.
  //
  // We deliberately avoid `useAuthenticatedCallback` from
  // `@liberfi/ui-base` here because that variant `await`s `signIn()`
  // and then synchronously checks a status ref that may not have
  // propagated yet — that race throws "User is not authenticated
  // after signing in" even on a successful Privy login. The SDK's
  // `useAuthCallback` doesn't try to chain post-auth work, so it
  // sidesteps the race entirely.
  const { onOpen: openHlUsdcDeposit } = useAsyncModal(
    DEPOSIT_HL_USDC_MODAL_ID,
  );
  const handleAddFunds = useAuthCallback(
    useCallback(() => {
      void openHlUsdcDeposit();
    }, [openHlUsdcDeposit]),
  );

  // Sign + relay the Hyperliquid `updateLeverage` action when the user
  // confirms a new leverage value in the form's modal. The hook returns
  // a stable promise-returning callback so the SDK widget can drive its
  // button's loading state and error recovery.
  //
  // The unauth path is handled inside the SDK's LeverageModal via
  // `useAuthCallback(handleConfirm)`: signed-out clicks short-circuit
  // before this callback is ever invoked, so we don't wrap auth here.
  const updateLeverage = useHyperliquidUpdateLeverage();
  const handleUpdateLeverage = useCallback(
    (leverage: number) => updateLeverage({ symbol, leverage }),
    [updateLeverage, symbol],
  );

  // Sign + relay the Hyperliquid `order` action when the user submits
  // the place-order form. Returns a `PlaceOrderResult` to satisfy the
  // SDK's callback contract (status, oid, avgPrice for filled
  // orders). The hook owns toasts and cache invalidation; the widget
  // owns spinner / button-state via `useMutation`.
  //
  // The active perpetuals client (`HyperliquidPerpetualsClient`) is
  // read-only and throws on `placeOrder`, so this hook is the only
  // path that actually submits orders today. Passing the callback to
  // `PlaceOrderFormWidget` switches the SDK's `handleSubmit` onto
  // the host-signed branch and skips the throwing path entirely.
  const placeOrder = useHyperliquidPlaceOrder();

  // Same story for `cancelOrder` / cancelOrders — the SDK's
  // `HyperliquidPerpetualsClient.cancelOrder` is a deliberate stub
  // (it cannot hold private keys), so `OpenOrdersWidget` needs the
  // host to inject signers. We expose BOTH props:
  //   - cancelOrder  → signs ONE leg per click (per-row x button)
  //   - cancelOrders → signs ALL legs in ONE wallet prompt
  //                   (`Cancel All`)
  // The hook returns an object with both functions so the page just
  // forwards them via spread; see `useHyperliquidCancelOrder` for the
  // venue-specific signing + cache-invalidation logic.
  const { cancelOrder, cancelOrders } = useHyperliquidCancelOrder();

  const handleSelectCoin = useCallback((selected: string) => {
    setSymbol(selected);
    setShowSearch(false);
  }, []);

  // Open-orders count rendered next to the tab label as
  // `Open Orders (N)`. The bottom panel — Positions and Open Orders
  // alike — shows **all coins**, not filtered by
  // the chart symbol. The query runs without a `symbol` filter so:
  //   1. It hits the same react-query cache slot the SDK's `webData2`
  //      WebSocket subscription writes to (via
  //      `useAccountStateSubscription`). Cache key alignment means the
  //      counter and the table populate **the instant the WS frame
  //      arrives** — no second REST round-trip on tab switch.
  //   2. The counter / table never go stale: every webData2 push
  //      updates them in lockstep.
  // The widgets below are similarly mounted without `symbol` for the
  // same reason.
  const { data: openOrdersData } = useOrdersQuery(
    { userAddress },
    { enabled: !!userAddress },
  );
  const openOrdersCount = openOrdersData?.orders.length ?? 0;
  const openOrdersTabLabel =
    openOrdersCount > 0
      ? t("perpetuals.page.tab.openOrders", { count: openOrdersCount })
      : t("perpetuals.page.tab.openOrdersEmpty");

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
                <PerpetualsChart symbol={symbol} client={client} />
              </div>

              {/* Positions / Orders / History tab bar */}
              <div className="flex-none flex items-center" style={{ height: 36, padding: '0 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
                {(
                  [
                    { key: "positions", label: t("perpetuals.page.tab.positions") },
                    { key: "openOrders", label: openOrdersTabLabel },
                    { key: "tradeHistory", label: t("perpetuals.page.tab.trades") },
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

              {/* Positions / Open Orders / Trades content — fills
                  remaining ~40%.

                  `PositionsWidget` and `OpenOrdersWidget` are mounted
                  WITHOUT `symbol` so they show **all coins** regardless
                  of the selected chart. This also aligns the widget's
                  react-query cache key with the slot
                  `useAccountStateSubscription` writes to from the
                  `webData2` push, so the table populates the instant the
                  WS frame arrives — no extra REST round-trip on tab
                  switch. */}
              <div className="flex-[2] min-h-0 overflow-auto" style={{ backgroundColor: '#000000' }}>
                {activeTab === "positions" && <PositionsWidget userAddress={userAddress} onPlaceOrder={placeOrder} />}
                {activeTab === "openOrders" && (
                  <OpenOrdersWidget
                    userAddress={userAddress}
                    cancelOrder={cancelOrder}
                    cancelOrders={cancelOrders}
                  />
                )}
                {activeTab === "tradeHistory" && (
                  <TradeHistoryWidget userAddress={userAddress} />
                )}
              </div>
            </>
          )}

          {mobileMainTab === "orderBook" && (
            // Mobile: let the widget own its layout (independent ask/bid
            // scrolls). The wrapper just clips overflow so the widget's
            // internal min-h-0 flex math works.
            <div className="flex-1 min-h-0 overflow-hidden">
              <OrderBookWidget
                symbol={symbol}
                maxLevel={50}
                className="h-full"
              />
            </div>
          )}

          {mobileMainTab === "trades" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <TradesWidget symbol={symbol} limit={100} className="h-full" />
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
            {t("perpetuals.page.direction.long")}
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
            {t("perpetuals.page.direction.short")}
          </button>
        </div>

        {/* Mobile place order bottom sheet */}
        {showMobileOrder && (
          <MobilePlaceOrderSheet
            symbol={symbol}
            userAddress={userAddress}
            onClose={() => setShowMobileOrder(false)}
            onAddFunds={handleAddFunds}
            onUpdateLeverage={handleUpdateLeverage}
            onPlaceOrder={placeOrder}
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

      {/* Main content layout:
            ┌─────────────────────── left section ─────────────────────┐  ┌── PlaceOrder ──┐
            │  ┌─ Chart sub-col (CoinInfo + Chart) ─┐ ┌─ OB sub-col ─┐ │  │                │
            │  │                                    │ │              │ │  │                │
            │  └────────────────────────────────────┘ └──────────────┘ │  │                │
            │  ─── SplitHandle ────────────────────────────────────────│  │                │
            │  Positions / Open Orders / Trades  (spans chart + OB)    │  │                │
            └──────────────────────────────────────────────────────────┘  └────────────────┘ */}
      <div className="flex-1 min-h-0 flex">
        {/* Left section: Chart+OB on top, Positions on bottom */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top half: Chart sub-col + OB sub-col side by side */}
          <div className="flex-1 min-h-0 flex">
            {/* Chart sub-col: CoinSelectorBar header + Chart */}
            <div className="flex-1 min-w-0 flex flex-col" style={{ borderRight: '1px solid rgba(39,39,42,0.6)' }}>
              <CoinSelectorBar
                tokenSymbol={tokenSymbol}
                symbol={symbol}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                handleSelectCoin={handleSelectCoin}
              />
              <div className="flex-1 min-h-0 flex flex-col">
                <PerpetualsChart symbol={symbol} client={client} />
              </div>
            </div>

            {/* OB sub-col: OrderBook / Trades, top-aligned to TickerStrip,
                bottom-aligned to chart (i.e. ends at SplitHandle) */}
            <div className="flex flex-col overflow-hidden" style={{ width: 290, minWidth: 290 }}>
              <div className="flex-none flex items-center" style={{ height: 36, padding: '0 16px 0 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
                {(
                  [
                    { key: "orderBook", label: t("perpetuals.page.tab.orderBook") },
                    { key: "trades", label: t("perpetuals.page.tab.trades") },
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
                  // Fetch ~50 levels per side so that even with the largest
                  // aggregation step (1000 USD) there are several visible
                  // buckets, and so that asks/bids each have enough rows to
                  // overflow their independent scroll containers.
                  <OrderBookWidget
                    symbol={symbol}
                    maxLevel={50}
                    className="h-full"
                  />
                ) : (
                  <TradesWidget symbol={symbol} limit={100} className="h-full" />
                )}
              </div>
            </div>
          </div>

          {/* Draggable split handle — splits the left section vertically */}
          <SplitHandle onResize={setBottomHeight} currentHeight={bottomHeight} />

          {/* Bottom panel: Positions / Open Orders / Trades — spans the
              entire left section (chart + OB widths) */}
          <div className="flex-none flex flex-col" style={{ height: bottomHeight }}>
            <div className="flex-none flex items-center" style={{ height: 36, padding: '0 16px 0 8px', borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
              {(
                  [
                    { key: "positions", label: t("perpetuals.page.tab.positions") },
                    { key: "openOrders", label: openOrdersTabLabel },
                    { key: "tradeHistory", label: t("perpetuals.page.tab.trades") },
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
            {/* Positions / Open Orders are all-coin (no `symbol` filter)
                to keep the cache key aligned with the
                webData2 WS write — see the mobile branch above for the
                full rationale. */}
            <div className="flex-1 min-h-0 overflow-auto" style={{ backgroundColor: '#000000' }}>
              {activeTab === "positions" && <PositionsWidget userAddress={userAddress} onPlaceOrder={placeOrder} />}
              {activeTab === "openOrders" && (
                <OpenOrdersWidget
                  userAddress={userAddress}
                  cancelOrder={cancelOrder}
                  cancelOrders={cancelOrders}
                />
              )}
              {activeTab === "tradeHistory" && (
                <TradeHistoryWidget userAddress={userAddress} />
              )}
            </div>
          </div>
        </div>

        {/* PlaceOrder (full main height, fixed 320px). Bottom aligns with
            the Positions row — both stop at the main content's bottom edge. */}
        <div className="flex flex-col overflow-hidden" style={{ width: 320, minWidth: 320, maxWidth: 320, borderLeft: '1px solid rgba(39,39,42,0.6)' }}>
          <PlaceOrderFormWidget
            symbol={symbol}
            userAddress={userAddress}
            className="h-full"
            onAddFunds={handleAddFunds}
            onUpdateLeverage={handleUpdateLeverage}
            onPlaceOrder={placeOrder}
          />
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
            className="absolute top-full left-0 z-50 flex flex-col overflow-hidden"
            style={{
              width: isMobile ? '100vw' : 800,
              height: isMobile ? '60vh' : 400,
              background: 'rgba(24,24,27,1)',
              border: '1px solid rgba(39,39,42,1)',
              borderRadius: isMobile ? 0 : 14,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              paddingBottom: 8,
              marginTop: isMobile ? 0 : -8,
              marginLeft: isMobile ? 0 : 12,
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
  const { t } = useTranslation();
  const tabs: { key: MobileMainTab; label: string }[] = [
    { key: "chart", label: t("perpetuals.page.tab.chart") },
    { key: "orderBook", label: t("perpetuals.page.tab.orderBook") },
    { key: "trades", label: t("perpetuals.page.tab.trades") },
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
  userAddress,
  onClose,
  onAddFunds,
  onUpdateLeverage,
  onPlaceOrder,
}: {
  symbol: string;
  userAddress?: string;
  onClose: () => void;
  onAddFunds?: () => void;
  onUpdateLeverage?: (leverage: number) => Promise<void>;
  onPlaceOrder?: React.ComponentProps<
    typeof PlaceOrderFormWidget
  >["onPlaceOrder"];
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
          <PlaceOrderFormWidget
            symbol={symbol}
            userAddress={userAddress}
            onAddFunds={onAddFunds}
            onUpdateLeverage={onUpdateLeverage}
            onPlaceOrder={onPlaceOrder}
          />
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

/**
 * Horizontal ticker strip showing popular coins with their 24h change.
 *
 * The strip reads from the global `useUniverseQuery` cache (one HTTP
 * round-trip / 60s shared across the whole page) instead of mounting
 * a `useCoinInfo` per item. Concretely this swaps:
 *
 *   - N × REST `metaAndAssetCtxs` polls (one per ticker item) → 1
 *   - N × `activeAssetCtx` WS subscriptions               → 0
 *
 * The universe cache is also kept hot by `useAccountStateSubscription`
 * — every `webData2` push writes the latest `assetCtxs` directly into
 * `universeQueryKey()`, so the ticker re-renders in real time off the
 * same WS frame the place-order form already consumes.
 *
 * If the active client doesn't expose `getUniverseSnapshot()` (e.g.
 * non-Hyperliquid adapters), the universe query is disabled and the
 * tickers degrade gracefully to a static "—" change %.
 */
function TickerStrip({
  activeSymbol,
  onSelectCoin,
}: {
  activeSymbol: string;
  onSelectCoin: (coin: string) => void;
}) {
  const { data: universe } = useUniverseQuery();

  return (
    <div className="flex-none flex items-center overflow-x-auto" style={{ height: 28, gap: 16, padding: '0 12px', borderBottom: '1px solid rgba(39,39,42,0.6)', backgroundColor: '#0a0a0b' }}>
      {TICKER_COINS.map((coin) => (
        <TickerItem
          key={coin}
          coin={coin}
          isActive={activeSymbol === coin}
          onSelect={() => onSelectCoin(coin)}
          universe={universe}
        />
      ))}
    </div>
  );
}

/**
 * Single entry in the ticker strip.
 *
 * Pure presentation: looks up `${coin}-USDC` in the snapshot the parent
 * already holds, so re-renders are driven by universe-level cache
 * updates (poll cadence + webData2 pushes) and not by component-local
 * subscriptions.
 */
function TickerItem({
  coin,
  isActive,
  onSelect,
  universe,
}: {
  coin: string;
  isActive: boolean;
  onSelect: () => void;
  universe: UniverseSnapshot | undefined;
}) {
  const entry = universe?.bySymbol.get(`${coin}-USDC`);
  const change = entry?.market.change24h;
  const isPositive = (change ?? 0) >= 0;
  const changeStr =
    typeof change === "number"
      ? `${isPositive ? "+" : ""}${change.toFixed(2)}%`
      : "—";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center cursor-pointer transition-colors"
      style={{
        gap: 4,
        padding: '2px 4px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        color: '#b5b5b5',
        backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
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
}
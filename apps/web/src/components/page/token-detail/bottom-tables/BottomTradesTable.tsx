"use client";

import { useTokenActivitiesListScript } from "@liberfi.io/ui-tokens";
import type { Activity, ActivityType, Chain } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import {
  formatAmount,
  formatAmountUSDCompact,
  formatPriceUSD,
  truncateAddress,
} from "@liberfi.io/utils";
import { useTranslation } from "@liberfi/ui-base";
import {
  alignClass,
  EmptyBody,
  TableShell,
  type BottomTableColumn,
} from "./table-shell";

export interface BottomTradesTableProps {
  chain: Chain;
  address: string;
}

const COLUMNS: ReadonlyArray<BottomTableColumn> = [
  {
    key: "age",
    labelKey: "extend.trade.bottom_panel.trades.age",
    width: "w-[10%]",
    align: "left",
  },
  {
    key: "type",
    labelKey: "extend.trade.bottom_panel.trades.type",
    width: "w-[9%]",
    align: "left",
  },
  {
    key: "usd",
    labelKey: "extend.trade.bottom_panel.trades.usd",
    width: "w-[13%]",
    align: "right",
  },
  {
    key: "amount",
    labelKey: "extend.trade.bottom_panel.trades.amount",
    width: "w-[16%]",
    align: "right",
  },
  {
    key: "price",
    labelKey: "extend.trade.bottom_panel.trades.price",
    width: "w-[14%]",
    align: "right",
  },
  {
    key: "trader",
    labelKey: "extend.trade.bottom_panel.trades.trader",
    width: "w-[20%]",
    align: "right",
  },
];

/**
 * GMGN-style trades (activity) table — replaces the SDK's
 * {@link TokenActivitiesListWidget} on the consumer side. Re-uses the
 * SDK's script hook so pagination + realtime subscription behavior stay
 * identical; only the rendering changes.
 *
 * Columns (per `gmgn-token-detail-design-reference` §7):
 *
 *   Age | Type | USD | Amount | Price | Trader
 *
 * Coloring follows GMGN's event-type map:
 *   - Buy / Add Liq → text-bullish
 *   - Sell / Remove Liq → text-bearish
 *   - Burn → text-warning
 *
 * Amount uses the *primary* token (the one being received on buy / spent
 * on sell), formatted compactly with K/M/B abbreviations. USD totals also
 * use the compact formatter.
 */
export function BottomTradesTable({ chain, address }: BottomTradesTableProps) {
  const { activities, isLoading, hasMore, loadMore } =
    useTokenActivitiesListScript({ chain, address });
  const now = Date.now();
  const isInitialLoading = isLoading && activities.length === 0;
  const isEmpty = !isLoading && activities.length === 0;

  return (
    <TableShell
      columns={COLUMNS}
      minWidth="min-w-[760px]"
      isInitialLoading={isInitialLoading}
      infiniteScroll={{ hasMore, isLoading, onLoadMore: loadMore }}
    >
      <tbody>
        {activities.map((a) => (
          <TradeRow key={a.txHash} activity={a} now={now} />
        ))}
      </tbody>
      {isEmpty ? <EmptyBody colSpan={COLUMNS.length} /> : null}
    </TableShell>
  );
}

function TradeRow({ activity, now }: { activity: Activity; now: number }) {
  const { t } = useTranslation();
  const primary = pickPrimaryToken(activity);
  const sideMeta = TYPE_META[activity.type];

  return (
    <tr className="h-10 border-b border-divider transition-colors hover:bg-content2">
      <td className={cn("px-3 align-middle text-default-500", alignClass("left"))}>
        {formatAgeShort(activity.time, now)}
      </td>
      <td
        className={cn(
          "px-3 align-middle font-medium",
          alignClass("left"),
          sideMeta.color,
        )}
      >
        {t(sideMeta.labelKey)}
      </td>
      <td
        className={cn(
          "px-3 align-middle font-medium tabular-nums",
          alignClass("right"),
          sideMeta.color,
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        {primary.amountInUsd ? formatAmountUSDCompact(primary.amountInUsd) : "--"}
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-foreground",
          alignClass("right"),
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        <span>{formatAmount(primary.amount)}</span>
        <span className="ml-1 text-default-500">{primary.symbol}</span>
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-default-500",
          alignClass("right"),
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        {primary.priceInUsd ? formatPriceUSD(primary.priceInUsd) : "--"}
      </td>
      <td
        className={cn(
          "px-3 align-middle font-mono tabular-nums text-default-500",
          alignClass("right"),
        )}
      >
        {truncateAddress(activity.walletAddress, 4, 4)}
      </td>
    </tr>
  );
}

/**
 * Pick the token that represents the user's side of the trade.
 *   - Buy: user receives `to`.
 *   - Sell: user spends `from`.
 *   - Liquidity / red-packet: prefer the LP token (`to`).
 */
function pickPrimaryToken(a: Activity) {
  if (a.type === "sell") return a.from;
  return a.to;
}

interface TypeMeta {
  labelKey: string;
  color: string;
}

const TYPE_META: Record<ActivityType, TypeMeta> = {
  buy: {
    labelKey: "extend.trade.bottom_panel.trades.side_buy",
    color: "text-bullish",
  },
  sell: {
    labelKey: "extend.trade.bottom_panel.trades.side_sell",
    color: "text-bearish",
  },
  liquidity_initialize: {
    labelKey: "extend.trade.bottom_panel.trades.side_add_liq",
    color: "text-bullish",
  },
  liquidity_add: {
    labelKey: "extend.trade.bottom_panel.trades.side_add_liq",
    color: "text-bullish",
  },
  liquidity_remove: {
    labelKey: "extend.trade.bottom_panel.trades.side_remove_liq",
    color: "text-bearish",
  },
  red_packet_create: {
    labelKey: "extend.trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
  red_packet_claim: {
    labelKey: "extend.trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
  red_packet_complete: {
    labelKey: "extend.trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
  red_packet_refund: {
    labelKey: "extend.trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
};

/**
 * Inline copy of the SDK's `formatAgeShort` helper. We re-implement here
 * to avoid coupling the consumer to a non-public SDK utility — the
 * algorithm is short and stable.
 */
function formatAgeShort(from: Date | string | number | undefined, now: number) {
  if (from == null) return "--";
  const t = from instanceof Date ? from.getTime() : new Date(from).getTime();
  const sec = Math.max(0, Math.floor((now - t) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(day / 365)}y`;
}

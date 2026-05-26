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
          <TradeRow key={activityKey(a)} activity={a} now={now} />
        ))}
      </tbody>
      {isEmpty ? <EmptyBody colSpan={COLUMNS.length} /> : null}
    </TableShell>
  );
}

function TradeRow({ activity, now }: { activity: Activity; now: number }) {
  const { t } = useTranslation();
  const primary = pickPrimaryToken(activity);
  const sideMeta = resolveTypeMeta(activity.type);
  const sideLabel = sideMeta.labelKey
    ? t(sideMeta.labelKey)
    : (sideMeta.fallbackLabel ?? "--");

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
        {sideLabel}
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

/**
 * Compose a stable, render-unique React key for a single activity row.
 *
 * `txHash` alone is *not* unique: Solana routes a single multi-hop swap as
 * one transaction emitting one inner-instruction per leg, so the API
 * returns several `Activity` rows sharing the same `txHash`. The
 * combination of `(txHash, from.address, to.address, poolAddress)`
 * disambiguates legs — each leg trades a different token pair through a
 * different pool, so the tuple is unique within a transaction in
 * practice.
 *
 * We deliberately avoid mixing the array index into the key: the
 * intrinsic compound is stable across re-renders, so a real-time prepend
 * (e.g. a fresh trade pushed to the top of the list) will not cause every
 * row below it to re-mount, while load-more appends remain identity-
 * preserving as before.
 *
 * Edge case: two legs through the same pool with the same token pair
 * (e.g. wash-trade routed twice through one pool in a single tx) would
 * still collide. If that surfaces in the wild we can add the SDK-level
 * leg index — for now this is rare enough that I'd rather see the
 * warning surface a real data-quality issue than mask it with `idx`.
 */
function activityKey(a: Activity): string {
  return `${a.txHash}:${a.from.address}:${a.to.address}:${a.poolAddress ?? ""}`;
}

interface TypeMeta {
  /** i18n key — empty when the type is unknown and we fall back to a raw label. */
  labelKey: string;
  color: string;
  /** Raw label used only when `labelKey` is empty (unknown activity type). */
  fallbackLabel?: string;
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
 * Resolve metadata for an activity type with a safe fallback. The backend
 * may emit a type that the SDK's `ActivityType` union does not yet cover
 * (e.g. a newly added launchpad event, or a transient malformed row).
 * Returning a neutral entry instead of `undefined` keeps the whole trades
 * table from crashing in that case — we surface the raw type as the label
 * so the data is still inspectable.
 */
function resolveTypeMeta(type: ActivityType | string | undefined): TypeMeta {
  if (type && type in TYPE_META) return TYPE_META[type as ActivityType];
  return {
    labelKey: "",
    color: "text-default-500",
    fallbackLabel: type ? String(type).replace(/_/g, " ") : "--",
  };
}

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

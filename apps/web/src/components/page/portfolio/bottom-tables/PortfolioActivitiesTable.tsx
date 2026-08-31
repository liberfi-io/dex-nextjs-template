"use client";

import { useMemo, useRef } from "react";
import { useTokensQuery } from "@liberfi.io/react";
import { usePortfolioActivitiesScript } from "@liberfi.io/ui-portfolio";
import type { Activity, ActivityType, Chain, Token } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import { formatAmount, formatAmountInUsd, truncateAddress, txExplorerUrl } from "@liberfi.io/utils";
import { useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../../application/t";
import {
  alignClass,
  EmptyBody,
  TableShell,
  type BottomTableColumn,
} from "../../token-detail/bottom-tables/table-shell";
import { PortfolioActivitiesTableSkeleton } from "../skeletons/PortfolioActivitiesTableSkeleton";

const COLUMNS: ReadonlyArray<BottomTableColumn> = [
  {
    key: "age",
    labelKey: "portfolio.headers.age",
    width: "w-[10%]",
    align: "left",
  },
  {
    key: "type",
    labelKey: "portfolio.headers.type",
    width: "w-[10%]",
    align: "left",
  },
  {
    key: "token",
    labelKey: "portfolio.headers.token",
    width: "w-[24%]",
    align: "left",
  },
  {
    key: "amount",
    labelKey: "portfolio.headers.amount",
    width: "w-[18%]",
    align: "right",
  },
  {
    key: "usd",
    labelKey: "portfolio.headers.value",
    width: "w-[14%]",
    align: "right",
  },
  {
    key: "tx",
    labelKey: "portfolio.headers.tx",
    width: "w-[14%]",
    align: "right",
  },
];

export interface PortfolioActivitiesTableProps {
  chain: Chain;
  address: string;
}

/**
 * Wallet-activities (trades + liquidity events) table for the portfolio
 * page. Shares the layout primitives (`TableShell`, alignment, column
 * coloring) with `BottomTradesTable` so the two pages feel related, but
 * the columns are tuned for a wallet-centric view: instead of `Trader`
 * we surface the truncated transaction hash with an explorer link, since
 * the user already knows the wallet (it's their own).
 */
export function PortfolioActivitiesTable({ chain, address }: PortfolioActivitiesTableProps) {
  const { t } = useTranslation();
  const enabled = !!address;

  const { activities, isLoading, hasMore, loadMore } = usePortfolioActivitiesScript({
    chain,
    address,
    limit: 50,
  });

  // Address list of tokens referenced by visible activities — both `from`
  // and `to` may be of interest. Sorted to keep the cache key stable.
  const tokenAddresses = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.from?.address) set.add(a.from.address);
      if (a.to?.address) set.add(a.to.address);
    });
    return [...set].sort();
  }, [activities]);

  // `isLoading` mirrors React Query semantics — true only on the first
  // fetch, false on subsequent stale-while-revalidate polls. Lets us
  // gate the skeleton on token enrichment without flashing it on every
  // refetch.
  const { data: tokens, isLoading: tokensLoading } = useTokensQuery(
    { chain, addresses: tokenAddresses },
    { enabled: enabled && tokenAddresses.length > 0 },
  );

  const tokenByAddress = useMemo(() => {
    const map = new Map<string, Token>();
    tokens?.forEach((tk) => map.set(tk.address, tk));
    return map;
  }, [tokens]);

  const now = Date.now();
  // Skeleton window: until BOTH the activity list AND the token
  // enrichment have resolved. Without the second clause the rows
  // briefly render with portfolio-only symbols / missing names /
  // missing logos, then jump once the tokens query lands.
  const isInitialLoading =
    (isLoading && activities.length === 0) || (tokenAddresses.length > 0 && tokensLoading);
  const isEmpty = !isLoading && activities.length === 0;

  if (!enabled) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-text-muted">
        {t("portfolio.allocation.noWallet")}
      </div>
    );
  }

  if (isInitialLoading) {
    return <PortfolioActivitiesTableSkeleton columns={COLUMNS} />;
  }

  return (
    <TableShell
      columns={COLUMNS}
      minWidth="min-w-[820px]"
      infiniteScroll={{ hasMore, isLoading, onLoadMore: loadMore }}
    >
      <tbody>
        {activities.map((activity) => (
          <ActivityRow
            key={activityKey(activity)}
            activity={activity}
            now={now}
            tokenByAddress={tokenByAddress}
          />
        ))}
      </tbody>
      {isEmpty ? <EmptyBody colSpan={COLUMNS.length} messageKey="portfolio.noActivities" /> : null}
    </TableShell>
  );
}

interface ActivityRowProps {
  activity: Activity;
  now: number;
  tokenByAddress: Map<string, Token>;
}

function ActivityRow({ activity, now, tokenByAddress }: ActivityRowProps) {
  const { t } = useTranslation();
  const sideMeta = resolveTypeMeta(activity.type);
  const sideLabel = sideMeta.labelKey
    ? tKey(t, sideMeta.labelKey)
    : (sideMeta.fallbackLabel ?? "--");
  const primary = pickPrimaryToken(activity);
  const enrichedToken = tokenByAddress.get(primary.address);
  const symbol = enrichedToken?.symbol ?? primary.symbol;
  const name = enrichedToken?.name ?? primary.name ?? "";
  const imageUrl = enrichedToken?.image ?? primary.image;

  const explorer = txExplorerUrl(activity.chain, activity.txHash);

  return (
    <tr className="h-12 border-b border-default-50 transition-colors hover:bg-content2">
      <td className={cn("px-3 align-middle text-text-muted", alignClass("left"))}>
        {formatAgeShort(activity.time, now)}
      </td>
      <td className={cn("px-3 align-middle font-medium", alignClass("left"), sideMeta.color)}>
        {sideLabel}
      </td>
      <td className={cn("px-3 align-middle", alignClass("left"))}>
        <div className="flex items-center gap-2">
          <ActivityTokenAvatar imageUrl={imageUrl} symbol={symbol} address={primary.address} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {symbol || "—"}
            </span>
            {name ? <span className="truncate text-[11px] text-text-muted">{name}</span> : null}
          </div>
        </div>
      </td>
      <td
        className={cn("px-3 align-middle tabular-nums text-foreground", alignClass("right"))}
        style={{ letterSpacing: "-0.2px" }}
      >
        <span>{formatAmount(primary.amount)}</span>
        <span className="ml-1 text-text-muted">{primary.symbol}</span>
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums font-medium",
          alignClass("right"),
          sideMeta.color,
        )}
      >
        {primary.amountInUsd ? formatAmountInUsd(primary.amountInUsd) : "--"}
      </td>
      <td
        className={cn(
          "px-3 align-middle font-mono tabular-nums text-text-muted",
          alignClass("right"),
        )}
      >
        {explorer ? (
          <a
            href={explorer}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-foreground transition-colors"
          >
            {truncateAddress(activity.txHash, 4, 4)}
          </a>
        ) : (
          truncateAddress(activity.txHash, 4, 4)
        )}
      </td>
    </tr>
  );
}

/**
 * Pick the token most relevant to the wallet's side of the trade.
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
  fallbackLabel?: string;
}

const TYPE_META: Record<ActivityType, TypeMeta> = {
  buy: {
    labelKey: "trade.bottom_panel.trades.side_buy",
    color: "text-positive",
  },
  sell: {
    labelKey: "trade.bottom_panel.trades.side_sell",
    color: "text-negative",
  },
  liquidity_initialize: {
    labelKey: "trade.bottom_panel.trades.side_add_liq",
    color: "text-positive",
  },
  liquidity_add: {
    labelKey: "trade.bottom_panel.trades.side_add_liq",
    color: "text-positive",
  },
  liquidity_remove: {
    labelKey: "trade.bottom_panel.trades.side_remove_liq",
    color: "text-negative",
  },
  red_packet_create: {
    labelKey: "trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
  red_packet_claim: {
    labelKey: "trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
  red_packet_complete: {
    labelKey: "trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
  red_packet_refund: {
    labelKey: "trade.bottom_panel.trades.side_red_packet",
    color: "text-warning",
  },
};

function resolveTypeMeta(type: ActivityType | string | undefined): TypeMeta {
  if (type && type in TYPE_META) return TYPE_META[type as ActivityType];
  return {
    labelKey: "",
    color: "text-text-muted",
    fallbackLabel: type ? String(type).replace(/_/g, " ") : "--",
  };
}

/**
 * Stable key for an activity row. txHash is not unique on Solana
 * (multi-hop swaps emit one row per leg sharing the tx); the (txHash, from,
 * to, pool) tuple disambiguates them. Mirrors the helper in
 * `BottomTradesTable`.
 */
function activityKey(a: Activity): string {
  return `${a.txHash}:${a.from?.address ?? ""}:${a.to?.address ?? ""}:${a.poolAddress ?? ""}`;
}

function formatAgeShort(from: Date | string | number | undefined, now: number): string {
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

interface ActivityTokenAvatarProps {
  imageUrl?: string;
  symbol?: string;
  address: string;
}

/**
 * Inline token avatar for activity rows. Same shape as the assets-table
 * avatar but kept locally (rather than shared) so each table can evolve
 * independently — the avatar is a leaf and the abstraction overhead would
 * outweigh the duplication today.
 */
function ActivityTokenAvatar({ imageUrl, symbol, address }: ActivityTokenAvatarProps) {
  const ref = useRef<HTMLImageElement>(null);
  const initial = (symbol || "?").charAt(0).toUpperCase();
  const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bg = `hsl(${(hash * 53) % 360}, 60%, 40%)`;

  if (imageUrl) {
    return (
      <img
        ref={ref}
        src={imageUrl}
        alt={symbol ?? ""}
        width={24}
        height={24}
        loading="lazy"
        decoding="async"
        className="h-6 w-6 rounded-full object-cover bg-default-100 shrink-0"
        onError={() => {
          if (!ref.current) return;
          ref.current.style.display = "none";
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-text-primary shrink-0"
      style={{ background: bg }}
    >
      {initial}
    </span>
  );
}

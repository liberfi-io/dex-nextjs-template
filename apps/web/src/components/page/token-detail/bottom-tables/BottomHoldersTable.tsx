"use client";

import { useTokenHoldersListScript } from "@liberfi.io/ui-tokens";
import type { Chain, TokenHolder } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import {
  formatAmount,
  formatAmountUSDCompact,
  formatPercent,
  truncateAddress,
} from "@liberfi.io/utils";
import {
  alignClass,
  EmptyBody,
  TableShell,
  type BottomTableColumn,
} from "./table-shell";

export interface BottomHoldersTableProps {
  chain: Chain;
  address: string;
}

const COLUMNS: ReadonlyArray<BottomTableColumn> = [
  {
    key: "rank",
    labelKey: "extend.trade.bottom_panel.holders_table.rank",
    width: "w-[8%]",
    align: "left",
  },
  {
    key: "wallet",
    labelKey: "extend.trade.bottom_panel.holders_table.wallet",
    width: "w-[24%]",
    align: "left",
  },
  {
    key: "amount",
    labelKey: "extend.trade.bottom_panel.holders_table.amount",
    width: "w-[18%]",
    align: "right",
  },
  {
    key: "value",
    labelKey: "extend.trade.bottom_panel.holders_table.value",
    width: "w-[16%]",
    align: "right",
  },
  {
    key: "percentage",
    labelKey: "extend.trade.bottom_panel.holders_table.percentage",
    width: "w-[12%]",
    align: "right",
  },
  {
    key: "last_active",
    labelKey: "extend.trade.bottom_panel.holders_table.last_active",
    width: "w-[14%]",
    align: "right",
  },
];

/**
 * GMGN-style holders table — replaces the SDK's
 * {@link TokenHoldersListWidget} on the consumer side. Re-uses the SDK's
 * script hook so pagination + sort behavior stay consistent.
 *
 * Columns: # | Wallet | Amount | Value | % | Last Active
 *
 * Values are formatted with the same compact helpers used elsewhere in
 * the page (K/M/B abbreviations); percentages convert from the API's
 * `0-100` scale via `/100` before passing to `formatPercent`. Rank is
 * derived from the holder's index in the sorted list (1-based).
 */
export function BottomHoldersTable({ chain, address }: BottomHoldersTableProps) {
  const { holders, isLoading, hasMore, loadMore } = useTokenHoldersListScript({
    chain,
    address,
  });
  const now = Date.now();
  const isInitialLoading = isLoading && holders.length === 0;
  const isEmpty = !isLoading && holders.length === 0;

  return (
    <TableShell
      columns={COLUMNS}
      minWidth="min-w-[720px]"
      isInitialLoading={isInitialLoading}
      infiniteScroll={{ hasMore, isLoading, onLoadMore: loadMore }}
    >
      <tbody>
        {holders.map((h, idx) => (
          <HolderRow key={h.address} holder={h} rank={idx + 1} now={now} />
        ))}
      </tbody>
      {isEmpty ? <EmptyBody colSpan={COLUMNS.length} /> : null}
    </TableShell>
  );
}

function HolderRow({
  holder,
  rank,
  now,
}: {
  holder: TokenHolder;
  rank: number;
  now: number;
}) {
  return (
    <tr className="h-10 border-b border-divider transition-colors hover:bg-content2">
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-default-500",
          alignClass("left"),
        )}
      >
        {rank}
      </td>
      <td className={cn("px-3 align-middle", alignClass("left"))}>
        <span className="font-mono text-[12px] text-foreground">
          {truncateAddress(holder.address, 4, 4)}
        </span>
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-foreground",
          alignClass("right"),
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        {formatAmount(holder.amount)}
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-foreground",
          alignClass("right"),
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        {holder.amountInUsd ? formatAmountUSDCompact(holder.amountInUsd) : "--"}
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-default-500",
          alignClass("right"),
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        {formatRatioFrom100(holder.ratio)}
      </td>
      <td
        className={cn(
          "px-3 align-middle text-default-500",
          alignClass("right"),
        )}
      >
        {holder.lastActiveAt ? formatAgeShort(holder.lastActiveAt, now) : "--"}
      </td>
    </tr>
  );
}

/** Convert a 0–100 ratio string (e.g. `"12.345"`) to `"12.34%"`. */
function formatRatioFrom100(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "--";
  return formatPercent(Number(value) / 100);
}

/** Inline copy of SDK's `formatAgeShort`. See BottomTradesTable for rationale. */
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

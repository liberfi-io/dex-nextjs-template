"use client";

import { useTokenHoldersListScript } from "@liberfi.io/ui-tokens";
import type { Chain, TokenHolder } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import { formatAmountUSDCompact, truncateAddress } from "@liberfi.io/utils";
import {
  alignClass,
  EmptyBody,
  TableShell,
} from "./table-shell";
import { TOP_TRADERS_COLUMNS } from "./BottomEmptyTable";

export interface BottomTopTradersTableProps {
  chain: Chain;
  address: string;
}

/**
 * Top Traders table — temporary stub backed by the holders feed.
 *
 * Until the dedicated `/top_traders` upstream lands, we surface the
 * **top 50 holders by USD value** as a usable proxy: the people sitting
 * on the most tokens are the biggest stakeholders even if we cannot yet
 * compute their realised / unrealised PnL or trade counts. The empty
 * metric columns render as `--` so the table layout matches GMGN's
 * Top-Traders panel exactly — when the real endpoint ships, only the
 * data source (`useTokenHoldersListScript` → a future
 * `useTokenTopTradersListScript`) needs to change.
 *
 * Columns: # | Trader | Realized PnL | Unrealized PnL | Total PnL |
 *          Buys | Sells | Balance
 */
export function BottomTopTradersTable({
  chain,
  address,
}: BottomTopTradersTableProps) {
  // limit=50 keeps us to a single page; we intentionally do NOT pass
  // `infiniteScroll` to the shell so the list stops at 50 rows — these
  // are "top" traders, not a scrollable holder list.
  const { holders, isLoading } = useTokenHoldersListScript({
    chain,
    address,
    limit: 50,
  });
  const isInitialLoading = isLoading && holders.length === 0;
  const isEmpty = !isLoading && holders.length === 0;
  const topFifty = holders.slice(0, 50);

  return (
    <TableShell
      columns={TOP_TRADERS_COLUMNS}
      minWidth="min-w-[820px]"
      isInitialLoading={isInitialLoading}
    >
      <tbody>
        {topFifty.map((h, idx) => (
          <TopTraderRow key={h.address} holder={h} rank={idx + 1} />
        ))}
      </tbody>
      {isEmpty ? <EmptyBody colSpan={TOP_TRADERS_COLUMNS.length} /> : null}
    </TableShell>
  );
}

function TopTraderRow({
  holder,
  rank,
}: {
  holder: TokenHolder;
  rank: number;
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
      {/* PnL columns are placeholders until the dedicated upstream lands. */}
      <PlaceholderCell />
      <PlaceholderCell />
      <PlaceholderCell />
      <PlaceholderCell />
      <PlaceholderCell />
      <td
        className={cn(
          "px-3 align-middle tabular-nums text-foreground",
          alignClass("right"),
        )}
        style={{ letterSpacing: "-0.2px" }}
      >
        {holder.amountInUsd ? formatAmountUSDCompact(holder.amountInUsd) : "--"}
      </td>
    </tr>
  );
}

/**
 * Right-aligned `--` cell used for the metric columns we cannot yet
 * compute. Keeps the rendered row visually balanced against rows whose
 * data is fully populated by the upstream Top-Traders API in the future.
 */
function PlaceholderCell() {
  return (
    <td
      className={cn(
        "px-3 align-middle text-default-500",
        alignClass("right"),
      )}
    >
      --
    </td>
  );
}

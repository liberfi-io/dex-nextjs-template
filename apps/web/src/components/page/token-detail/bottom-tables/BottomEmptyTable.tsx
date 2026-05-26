"use client";

import {
  EmptyBody,
  TableShell,
  type BottomTableColumn,
} from "./table-shell";

export interface BottomEmptyTableProps {
  /** Column header definitions (GMGN-mirrored). */
  columns: ReadonlyArray<BottomTableColumn>;
  /** Min-width matching the columns layout. */
  minWidth: string;
}

/**
 * Shared "header-only, no data" table. Used by Top Traders and Dev
 * Tokens until the upstream data pipeline ships — gives users a stable
 * column reference so they know what the panel will eventually show.
 */
export function BottomEmptyTable({ columns, minWidth }: BottomEmptyTableProps) {
  return (
    <TableShell columns={columns} minWidth={minWidth}>
      <EmptyBody colSpan={columns.length} />
    </TableShell>
  );
}

/**
 * Top Traders columns — mirrors GMGN's "交易者" tab. Ranking + trader
 * address + PnL breakdown + trade counts. We hide the column for `balance`
 * for now because the rest of the page does not surface it either.
 */
export const TOP_TRADERS_COLUMNS: ReadonlyArray<BottomTableColumn> = [
  {
    key: "rank",
    labelKey: "extend.trade.bottom_panel.top_traders_table.rank",
    width: "w-[6%]",
    align: "left",
  },
  {
    key: "trader",
    labelKey: "extend.trade.bottom_panel.top_traders_table.trader",
    width: "w-[20%]",
    align: "left",
  },
  {
    key: "realized_pnl",
    labelKey: "extend.trade.bottom_panel.top_traders_table.realized_pnl",
    width: "w-[15%]",
    align: "right",
  },
  {
    key: "unrealized_pnl",
    labelKey: "extend.trade.bottom_panel.top_traders_table.unrealized_pnl",
    width: "w-[15%]",
    align: "right",
  },
  {
    key: "total_pnl",
    labelKey: "extend.trade.bottom_panel.top_traders_table.total_pnl",
    width: "w-[15%]",
    align: "right",
  },
  {
    key: "buys",
    labelKey: "extend.trade.bottom_panel.top_traders_table.buys",
    width: "w-[10%]",
    align: "right",
  },
  {
    key: "sells",
    labelKey: "extend.trade.bottom_panel.top_traders_table.sells",
    width: "w-[10%]",
    align: "right",
  },
  {
    key: "balance",
    labelKey: "extend.trade.bottom_panel.top_traders_table.balance",
    width: "w-[9%]",
    align: "right",
  },
];

/**
 * Dev Tokens columns — mirrors GMGN's "开发者代币" tab: every token the
 * creator has launched, with at-a-glance metrics. Status is a placeholder
 * for the bonding-curve / migrated state pill.
 */
export const DEV_TOKENS_COLUMNS: ReadonlyArray<BottomTableColumn> = [
  {
    key: "token",
    labelKey: "extend.trade.bottom_panel.dev_tokens_table.token",
    width: "w-[28%]",
    align: "left",
  },
  {
    key: "created",
    labelKey: "extend.trade.bottom_panel.dev_tokens_table.created",
    width: "w-[14%]",
    align: "left",
  },
  {
    key: "liquidity",
    labelKey: "extend.trade.bottom_panel.dev_tokens_table.liquidity",
    width: "w-[16%]",
    align: "right",
  },
  {
    key: "market_cap",
    labelKey: "extend.trade.bottom_panel.dev_tokens_table.market_cap",
    width: "w-[16%]",
    align: "right",
  },
  {
    key: "holders",
    labelKey: "extend.trade.bottom_panel.dev_tokens_table.holders",
    width: "w-[12%]",
    align: "right",
  },
  {
    key: "status",
    labelKey: "extend.trade.bottom_panel.dev_tokens_table.status",
    width: "w-[14%]",
    align: "right",
  },
];

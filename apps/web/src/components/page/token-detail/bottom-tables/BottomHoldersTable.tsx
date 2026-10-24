"use client";

import { useTickAge } from "@liberfi.io/hooks";
import { useTokenHoldersListScript } from "@liberfi.io/ui-tokens";
import type { Chain, TokenHolder } from "@liberfi.io/types";
import {
  CheckIcon,
  cn,
  CopyIcon,
  Sortable,
  StyledTooltip,
  toast,
  useCopyToClipboard,
  VirtualList,
  type VirtualRowComponentProps,
} from "@liberfi.io/ui";
import {
  accountExplorerUrl,
  formatAmount,
  formatAmountInUsd,
  formatPercent,
  SafeBigNumber,
  truncateAddress,
} from "@liberfi.io/utils";
import { useLocalizedTimeFormatter, useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../../application/t";
import { MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface BottomHoldersTableProps {
  chain: Chain;
  address: string;
}

const ROW_HEIGHT = 40;
const TX_LABEL = "TXs";
const VIRTUAL_OVERSCAN = 72;
const LOAD_MORE_THRESHOLD = 30;
const TABLE_WIDTH = 1360;
const TABLE_SIZE_STYLE = { minWidth: TABLE_WIDTH, width: "100%" };
const GRID_TEMPLATE_COLUMNS =
  "minmax(190px, 190fr) minmax(120px, 120fr) minmax(110px, 110fr) minmax(180px, 180fr) minmax(180px, 180fr) minmax(130px, 130fr) minmax(130px, 130fr) minmax(170px, 170fr)";

const HOLDER_COLUMNS: ReadonlyArray<{
  key: string;
  labelKey: string;
  align?: "left" | "right" | "center";
}> = [
  {
    key: "wallet",
    labelKey: "trade.bottom_panel.holders_table.wallet",
    align: "left",
  },
  {
    key: "last_active",
    labelKey: "trade.bottom_panel.holders_table.balance_last_active",
    align: "right",
  },
  {
    key: "first_held",
    labelKey: "trade.bottom_panel.holders_table.wallet_created",
    align: "right",
  },
  {
    key: "total_buy",
    labelKey: "trade.bottom_panel.holders_table.total_buy",
    align: "right",
  },
  {
    key: "total_sell",
    labelKey: "trade.bottom_panel.holders_table.total_sell",
    align: "right",
  },
  {
    key: "unrealized_pnl",
    labelKey: "trade.bottom_panel.holders_table.unrealized_pnl",
    align: "right",
  },
  {
    key: "total_profit",
    labelKey: "trade.bottom_panel.holders_table.total_profit",
    align: "right",
  },
  {
    key: "holdings",
    labelKey: "trade.bottom_panel.holders_table.holdings",
    align: "right",
  },
];

type HolderSortBy =
  | "amountPercentage"
  | "holdingUsd"
  | "totalPnl"
  | "lastActiveAt"
  | "unrealizedPnl"
  | "buyVolume"
  | "sellVolume"
  | "createdAt";
type HolderSortDirection = "asc" | "desc";

type HolderRowData = TokenHolder & {
  addressLabel?: string;
  avgBuyPriceUsd?: string;
  avgSellPriceUsd?: string;
  buyAmountCur?: string;
  buyVolumeUsd?: string;
  createdAt?: Date | string | number;
  exchange?: string;
  historyTransferInAmount?: string;
  historyTransferInCost?: string;
  nativeBalance?: string;
  roi?: string;
  sellAmountCur?: string;
  sellVolumeUsd?: string;
  totalBuyCount?: number;
  totalProfit?: string;
  totalSellCount?: number;
  transferInCount?: number;
  unrealizedPnlRatio?: string;
  unrealizedProfit?: string;
};

const HOLDER_SORT_BY_COLUMN: Partial<Record<string, HolderSortBy>> = {
  last_active: "lastActiveAt",
  first_held: "createdAt",
  total_buy: "buyVolume",
  total_sell: "sellVolume",
  unrealized_pnl: "unrealizedPnl",
  total_profit: "totalPnl",
  holdings: "amountPercentage",
};

type TokenHoldersListScriptWithSort = ReturnType<typeof useTokenHoldersListScript> & {
  holders: HolderRowData[];
  sortBy: HolderSortBy | undefined;
  sortDirection: HolderSortDirection | undefined;
  setSort: (sortBy: HolderSortBy | undefined, direction?: HolderSortDirection) => void;
};

export function BottomHoldersTable({ chain, address }: BottomHoldersTableProps) {
  const { t } = useTranslation();
  const { holders, isLoading, sortBy, sortDirection, setSort, hasMore, loadMore } =
    useTokenHoldersListScript({
      chain,
      address,
      limit: 50,
    }) as unknown as TokenHoldersListScriptWithSort;

  const isInitialLoading = isLoading && holders.length === 0;
  const isEmpty = !isLoading && holders.length === 0;
  const isPaging = isLoading && holders.length > 0;
  const rowCount = hasMore || isPaging ? holders.length + 1 : holders.length;
  const rowProps = useMemo<HolderVirtualRowData>(
    () => ({
      chain,
      holders,
      isPaging,
    }),
    [chain, holders, isPaging],
  );

  const handleRowsRendered = useCallback(
    (
      visibleRows: { startIndex: number; stopIndex: number },
      _allRows: { startIndex: number; stopIndex: number },
    ) => {
      if (!hasMore || isLoading) return;
      if (visibleRows.stopIndex >= holders.length - LOAD_MORE_THRESHOLD) {
        loadMore();
      }
    },
    [hasMore, holders.length, isLoading, loadMore],
  );

  return (
    <div className="flex h-[70vh] w-full flex-col overflow-hidden md:h-full">
      <div className="custom-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
        <div className="flex h-full flex-col" style={TABLE_SIZE_STYLE}>
          <div
            className="grid h-9 shrink-0 border-b border-divider bg-content1 text-[12px] font-medium text-text-muted"
            style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
          >
            {HOLDER_COLUMNS.map((col) => (
              <div
                key={col.key}
                className={cn("flex h-full items-center px-3", justifyClass(col.align))}
                style={{ letterSpacing: "-0.2px" }}
              >
                {HOLDER_SORT_BY_COLUMN[col.key] ? (
                  <HolderSortHeader
                    label={tKey(t, col.labelKey)}
                    sortBeforeSlash={
                      col.key === "total_buy" || col.key === "total_sell" || col.key === "holdings"
                    }
                    sortBy={HOLDER_SORT_BY_COLUMN[col.key]}
                    activeSortBy={sortBy}
                    activeSortDirection={sortDirection}
                    onSortChange={setSort}
                  />
                ) : (
                  tKey(t, col.labelKey)
                )}
              </div>
            ))}
          </div>

          {isInitialLoading ? (
            <HolderSkeletonRows />
          ) : isEmpty ? (
            <EmptyHolders />
          ) : (
            <VirtualList
              className="custom-scrollbar min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
              onRowsRendered={handleRowsRendered}
              rowComponent={HolderVirtualRow}
              rowCount={rowCount}
              rowHeight={ROW_HEIGHT}
              rowProps={rowProps}
              overscanCount={VIRTUAL_OVERSCAN}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function HolderSortHeader({
  label,
  sortBeforeSlash,
  sortBy,
  activeSortBy,
  activeSortDirection,
  onSortChange,
}: {
  label: string;
  sortBeforeSlash?: boolean;
  sortBy: HolderSortBy | undefined;
  activeSortBy: HolderSortBy | undefined;
  activeSortDirection: HolderSortDirection | undefined;
  onSortChange: (sortBy: HolderSortBy | undefined, direction?: HolderSortDirection) => void;
}) {
  if (!sortBy) return label;

  const active = sortBy === activeSortBy;
  const sort = active ? (activeSortDirection ?? "desc") : undefined;
  const handleSortChange = (direction?: HolderSortDirection) => {
    onSortChange(direction ? sortBy : undefined, direction);
  };
  return (
    <span className="inline-flex items-center gap-1">
      {sortBeforeSlash ? (
        <SortLabelWithIconBeforeSlash label={label} sort={sort} onSortChange={handleSortChange} />
      ) : (
        <Sortable sort={sort} onSortChange={handleSortChange}>
          {label}
        </Sortable>
      )}
    </span>
  );
}

function SortLabelWithIconBeforeSlash({
  label,
  sort,
  onSortChange,
}: {
  label: string;
  sort?: HolderSortDirection;
  onSortChange: (direction?: HolderSortDirection) => void;
}) {
  const slashIndex = label.indexOf("/");
  if (slashIndex < 0) {
    return (
      <Sortable sort={sort} onSortChange={onSortChange}>
        {label}
      </Sortable>
    );
  }

  return (
    <>
      <Sortable sort={sort} onSortChange={onSortChange}>
        {label.slice(0, slashIndex).trimEnd()}
      </Sortable>
      <span>{label.slice(slashIndex)}</span>
    </>
  );
}

interface HolderVirtualRowData {
  chain: Chain;
  holders: HolderRowData[];
  isPaging: boolean;
}

function HolderVirtualRow({
  index,
  style,
  chain,
  holders,
  isPaging,
}: VirtualRowComponentProps<HolderVirtualRowData>) {
  const holder = holders[index];
  if (!holder) {
    return (
      <div style={style}>
        <LoadMoreRow isLoading={isPaging} />
      </div>
    );
  }

  return (
    <div style={style}>
      <HolderRow chain={chain} holder={holder} rank={index + 1} />
    </div>
  );
}

const HolderRow = memo(function HolderRow({
  chain,
  holder,
  rank,
}: {
  chain: Chain;
  holder: HolderRowData;
  rank: number;
}) {
  return (
    <div
      className="grid h-10 border-b border-divider text-[12px] transition-colors hover:bg-content2"
      style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
    >
      <div className={cn("flex items-center px-3", justifyClass("left"))}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-content3 text-[10px] font-semibold text-text-secondary">
            {rank}
          </span>
          <HolderAddressActions chain={chain} address={holder.address} />
        </div>
      </div>
      <BalanceActivityCell
        chain={chain}
        nativeBalance={holder.nativeBalance}
        lastActiveAt={holder.lastActiveAt}
      />
      <AgeCell value={holder.createdAt} />
      <TradeFlowCell
        side="buy"
        volumeUsd={holder.buyVolumeUsd}
        avgPriceUsd={holder.avgBuyPriceUsd}
        tokenAmount={holder.buyAmountCur}
        count={holder.totalBuyCount}
      />
      <TradeFlowCell
        side="sell"
        volumeUsd={holder.sellVolumeUsd}
        avgPriceUsd={holder.avgSellPriceUsd}
        tokenAmount={holder.sellAmountCur}
        count={holder.totalSellCount}
      />
      <PnlCell value={holder.unrealizedProfit} ratio={holder.unrealizedPnlRatio} />
      <PnlCell value={holder.totalProfit} ratio={holder.roi} strong />
      <HoldingsCell amountInUsd={holder.amountInUsd} ratio={holder.ratio} />
    </div>
  );
});

const HolderAddressActions = memo(function HolderAddressActions({
  chain,
  address,
}: {
  chain: Chain;
  address: string;
}) {
  const { t } = useTranslation();
  const explorer = useMemo(() => getAccountExplorer(chain, address), [chain, address]);
  const explorerLabel = explorer
    ? t("trade.bottom_panel.open_in_explorer", {
        explorer: explorer.name,
      })
    : undefined;
  return (
    <div className="flex min-w-0 items-center gap-1">
      <HolderAddressCopyButton address={address} />
      {explorer ? (
        <StyledTooltip content={explorerLabel} placement="top">
          <a
            href={explorer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-4 shrink-0 cursor-pointer items-center justify-center text-text-muted transition-colors hover:text-primary-200"
            aria-label={explorerLabel}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </StyledTooltip>
      ) : null}
    </div>
  );
});

const HolderAddressCopyButton = memo(function HolderAddressCopyButton({
  address,
}: {
  address: string;
}) {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const copiedResetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleCopyAddress = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      copyToClipboard(address, () => {
        toast.success(t("tokens.copied.address"));
        setCopied(true);
        if (copiedResetTimerRef.current) {
          clearTimeout(copiedResetTimerRef.current);
        }
        copiedResetTimerRef.current = setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
    },
    [address, copyToClipboard, t],
  );

  useEffect(
    () => () => {
      if (copiedResetTimerRef.current) {
        clearTimeout(copiedResetTimerRef.current);
      }
    },
    [],
  );

  return (
    <button
      type="button"
      className="group flex min-w-0 cursor-pointer items-center gap-1 text-foreground transition-colors hover:text-primary-200"
      onClick={handleCopyAddress}
      aria-label={t("tokens.copied.address")}
    >
      <span className="truncate font-mono text-[12px] font-medium">
        {truncateAddress(address, 4, 4)}
      </span>
      {copied ? (
        <CheckIcon className="h-3 w-3 shrink-0 text-positive" />
      ) : (
        <CopyIcon className="h-3 w-3 shrink-0 text-text-muted transition-colors group-hover:text-primary-200" />
      )}
    </button>
  );
});

const BalanceActivityCell = memo(function BalanceActivityCell({
  chain,
  nativeBalance,
  lastActiveAt,
}: {
  chain: Chain;
  nativeBalance?: string;
  lastActiveAt?: Date | string | number;
}) {
  const { formatAge } = useLocalizedTimeFormatter();
  const date = normalizeDate(lastActiveAt);
  const ageMs = useTickAge(date ?? Date.now());
  const ageText = date ? formatAge(ageMs) : "--";
  const nativeText = formatNativeBalance(chain, nativeBalance);
  const fullTime = date ? date.toLocaleString() : null;

  return (
    <div className={cn("flex flex-col justify-center px-3 tabular-nums", alignClass("right"))}>
      <div className="text-[12px] leading-4 text-foreground">{nativeText}</div>
      <div className="text-[11px] leading-4 text-text-muted">
        {fullTime ? (
          <StyledTooltip content={fullTime} placement="top">
            <span>{ageText}</span>
          </StyledTooltip>
        ) : (
          ageText
        )}
      </div>
    </div>
  );
});

const TradeFlowCell = memo(function TradeFlowCell({
  side,
  volumeUsd,
  avgPriceUsd,
  tokenAmount,
  count,
}: {
  side: "buy" | "sell";
  volumeUsd?: string;
  avgPriceUsd?: string;
  tokenAmount?: string;
  count?: number;
}) {
  const tone = side === "buy" ? "text-positive" : "text-negative";
  return (
    <div className={cn("flex flex-col justify-center px-3 tabular-nums", alignClass("right"))}>
      <div className={cn("text-[12px] leading-4", tone)}>
        {formatAmountInUsdOrZero(volumeUsd)}
        <span className="px-1 text-text-muted">/</span>
        {formatAmountInUsdOrZero(avgPriceUsd)}
      </div>
      <div className="text-[11px] leading-4 text-text-muted">
        {formatAmountOrZero(tokenAmount)}
        <span className="px-1">/</span>
        {(count ?? 0).toLocaleString()} {TX_LABEL}
      </div>
    </div>
  );
});

const PnlCell = memo(function PnlCell({
  value,
  ratio,
  strong,
}: {
  value?: string;
  ratio?: string;
  strong?: boolean;
}) {
  const n = Number(normalizeNumberLikeOrZero(value));
  const tone =
    n === undefined || Number.isNaN(n)
      ? "text-text-muted"
      : n > 0
        ? "text-positive"
        : n < 0
          ? "text-negative"
          : "text-text-muted";

  return (
    <div
      className={cn(
        "flex flex-col justify-center px-3 tabular-nums",
        alignClass("right"),
        strong ? "font-medium" : undefined,
        tone,
      )}
      style={{ letterSpacing: "-0.2px" }}
    >
      <div className="text-[12px] leading-4">
        {formatAmountInUsdOrZero(value, { showPlusGtThanZero: true })}
      </div>
      <div className="text-[11px] leading-4">
        {formatRatioFromOne(normalizeNumberLikeOrZero(ratio), { signed: true })}
      </div>
    </div>
  );
});

const HoldingsCell = memo(function HoldingsCell({
  amountInUsd,
  ratio,
}: {
  amountInUsd?: string;
  ratio?: string;
}) {
  const ratioValue = parseRatioFrom100(ratio);
  const ratioText = ratioValue === undefined ? undefined : formatPercent(ratioValue / 100);
  const progressWidth = ratioValue === undefined ? 0 : Math.max(0, Math.min(100, ratioValue));
  const hasRatio = ratioText !== undefined;

  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-1 px-3 tabular-nums text-text-muted",
        alignClass("right"),
      )}
    >
      <div className="flex items-center justify-end gap-1 text-[12px] leading-4 text-foreground">
        <span>{amountInUsd ? formatAmountInUsd(amountInUsd) : "--"}</span>
        {hasRatio ? (
          <span className="rounded bg-content3 px-1.5 py-0.5 text-[11px] leading-4 text-text-muted">
            {ratioText}
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-end">
        {hasRatio ? (
          <div className="h-1 w-20 overflow-hidden rounded-full bg-divider">
            <div
              className="h-full rounded-full bg-default-500"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
});

const AgeCell = memo(function AgeCell({ value }: { value?: Date | string | number }) {
  const { formatAge } = useLocalizedTimeFormatter();
  const date = normalizeDate(value);
  const ageMs = useTickAge(date ?? Date.now());
  const ageText = date ? formatAge(ageMs) : "--";
  const fullTime = date ? date.toLocaleString() : null;

  const content = (
    <span className={cn(date ? "text-foreground" : "text-text-muted")}>{ageText}</span>
  );

  return (
    <div className={cn("flex items-center px-3 text-text-muted", justifyClass("right"))}>
      {fullTime ? (
        <StyledTooltip content={fullTime} placement="top">
          {content}
        </StyledTooltip>
      ) : (
        content
      )}
    </div>
  );
});

function normalizeDate(value: Date | string | number | undefined): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const timestamp =
    typeof value === "number" && value > 0 && value < 1_000_000_000_000 ? value * 1000 : value;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

function EmptyHolders() {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-1 items-center justify-center py-16 text-[12px] text-text-muted"
      role="status"
    >
      {t("trade.bottom_panel.no_data")}
    </div>
  );
}

function LoadMoreRow({ isLoading }: { isLoading: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-10 items-center justify-center text-[12px] text-text-muted">
      {isLoading ? (
        <div className="flex items-center gap-2" role="status">
          <span
            aria-hidden
            className="block size-3 animate-spin rounded-full border border-default-300 border-t-default-600"
          />
          <span>{t("trade.bottom_panel.loading")}</span>
        </div>
      ) : (
        <span aria-hidden className="block h-px w-px" />
      )}
    </div>
  );
}

function HolderSkeletonRows() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, row) => (
        <div
          key={row}
          className="grid h-12 border-b border-divider"
          style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
        >
          {HOLDER_COLUMNS.map((col, idx) => (
            <div key={col.key} className="flex flex-col justify-center px-3">
              <div
                className={cn(
                  "h-3 animate-pulse rounded-sm bg-content3",
                  idx === 0 ? "w-28" : idx > 2 ? "ml-auto w-20" : "ml-auto w-14",
                )}
              />
              {idx >= 3 ? (
                <div className="mt-2 ml-auto h-2 w-16 animate-pulse rounded-sm bg-content3/70" />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function alignClass(align: "left" | "right" | "center" | undefined) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function justifyClass(align: "left" | "right" | "center" | undefined) {
  if (align === "right") return "justify-end text-right";
  if (align === "center") return "justify-center text-center";
  return "justify-start text-left";
}

function parseRatioFrom100(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  if (Number.isNaN(n)) return undefined;
  return n;
}

function formatRatioFromOne(
  value: string | number | undefined,
  options?: { signed?: boolean },
): string {
  if (value === undefined || value === null || value === "") return "--";
  const n = Number(value);
  if (Number.isNaN(n)) return "--";
  return formatPercent(n, { showPlusGtThanZero: options?.signed });
}

function formatAmountInUsdOrZero(
  value: string | number | undefined,
  options?: Parameters<typeof formatAmountInUsd>[1],
): string {
  return formatAmountInUsd(normalizeNumberLikeOrZero(value), options);
}

function formatAmountOrZero(value: string | number | undefined): string {
  return formatAmount(normalizeNumberLikeOrZero(value));
}

function normalizeNumberLikeOrZero(value: string | number | undefined) {
  return value === undefined || value === null || value === "" ? "0" : value;
}

function formatNativeBalance(chain: Chain, value: string | undefined): string {
  if (!value) return "--";
  const decimals = nativeBalanceDecimals(chain);
  const amount = new SafeBigNumber(value).shiftedBy(-decimals).toString();
  return `${formatAmount(amount)} ${nativeSymbol(chain)}`;
}

function nativeBalanceDecimals(chain: Chain): number {
  switch (chain) {
    case "900900900":
    case "901901901":
    case "902902902":
      return 9;
    default:
      return 18;
  }
}

function nativeSymbol(chain: Chain): string {
  switch (chain) {
    case "900900900":
    case "901901901":
    case "902902902":
      return "SOL";
    case "56":
    case "97":
      return "BNB";
    case "137":
      return "POL";
    case "43114":
      return "AVAX";
    default:
      return "ETH";
  }
}

function getAccountExplorer(
  chain: Chain,
  account: string,
): { name: string; url: string } | undefined {
  const url = accountExplorerUrl(chain, account);
  if (!url) return undefined;
  return {
    name: accountExplorerName(chain),
    url,
  };
}

function accountExplorerName(chain: Chain): string {
  switch (chain) {
    case "900900900":
    case "901901901":
    case "902902902":
      return "Solscan";
    case "1":
      return "Etherscan";
    case "56":
    case "97":
      return "BscScan";
    case "137":
      return "Polygonscan";
    case "43114":
      return "Snowtrace";
    case "8453":
      return "Basescan";
    case "81457":
      return "Blast Explorer";
    case "42161":
    case "42170":
    case "421613":
    case "421614":
      return "Arbiscan";
    default:
      return "Explorer";
  }
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

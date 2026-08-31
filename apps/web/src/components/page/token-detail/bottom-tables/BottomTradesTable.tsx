"use client";

import { useTickAge } from "@liberfi.io/hooks";
import { useTokenActivitiesListScript } from "@liberfi.io/ui-tokens";
import type { Activity, ActivityType, Chain } from "@liberfi.io/types";
import {
  CheckIcon,
  cn,
  CopyIcon,
  StyledTooltip,
  toast,
  useCopyToClipboard,
  VirtualList,
  type VirtualRowComponentProps,
} from "@liberfi.io/ui";
import { SortAscIcon } from "../../../../application/icons/SortAscIcon";
import { SortDescIcon } from "../../../../application/icons/SortDescIcon";
import {
  accountExplorerUrl,
  formatAge,
  formatAmount,
  formatAmountInUsd,
  formatPriceInUsd,
  txExplorerUrl,
  truncateAddress,
} from "@liberfi.io/utils";
import { useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../../application/t";
import { MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface BottomTradesTableProps {
  chain: Chain;
  address: string;
}

const ROW_HEIGHT = 40;
const VIRTUAL_OVERSCAN = 72;
const LOAD_MORE_THRESHOLD = 30;
const TABLE_WIDTH = 1280;
const TABLE_SIZE_STYLE = { minWidth: TABLE_WIDTH, width: "100%" };
const GRID_TEMPLATE_COLUMNS =
  "minmax(120px, 120fr) minmax(90px, 90fr) minmax(150px, 150fr) minmax(150px, 150fr) minmax(160px, 160fr) minmax(140px, 140fr) minmax(240px, 240fr) minmax(230px, 230fr)";

const ACTIVITY_COLUMNS = [
  {
    key: "age",
    labelKey: "trade.bottom_panel.trades.age",
    align: "left",
  },
  {
    key: "type",
    labelKey: "trade.bottom_panel.trades.type",
    align: "left",
  },
  {
    key: "price",
    labelKey: "trade.bottom_panel.trades.price",
    align: "right",
  },
  {
    key: "amount",
    labelKey: "trade.bottom_panel.trades.amount",
    align: "right",
  },
  {
    key: "usd",
    labelKey: "trade.bottom_panel.trades.total_usd",
    align: "right",
  },
  {
    key: "gas",
    labelKey: "trade.bottom_panel.trades.gas_fee",
    align: "right",
  },
  {
    key: "trader",
    labelKey: "trade.bottom_panel.trades.trader",
    align: "right",
  },
  {
    key: "tx",
    labelKey: "trade.bottom_panel.trades.tx",
    align: "right",
  },
] as const;

type ActivitySortBy = "timestamp" | "totalUsd";
type ActivitySortDirection = "asc" | "desc";

interface ActivityListScriptState {
  activities: Activity[];
  isLoading: boolean;
  sortBy: ActivitySortBy | undefined;
  sortDirection: ActivitySortDirection;
  setSortBy: (sortBy: ActivitySortBy | undefined, direction?: ActivitySortDirection) => void;
  hasMore: boolean;
  loadMore: () => void;
}

const ACTIVITY_SORT_BY_COLUMN: Partial<Record<string, ActivitySortBy>> = {
  age: "timestamp",
  usd: "totalUsd",
};

/**
 * Activity table backed by Phase 3 token activities.
 *
 * Field availability vs the GMGN reference:
 * - Available: time, type, price, token amount, total USD, gas fee, trader address.
 * - Partially available: trader tags exist, but the current UI only exposes them
 *   through SDK metadata and does not have GMGN's tracked/developer action counts.
 * - Missing: track state, developer marker/count, and right-side action icons.
 */
export function BottomTradesTable({ chain, address }: BottomTradesTableProps) {
  const { activities, isLoading, sortBy, sortDirection, setSortBy, hasMore, loadMore } =
    useTokenActivitiesListScript({
      chain,
      address,
      limit: 50,
    }) as unknown as ActivityListScriptState;
  const isInitialLoading = isLoading && activities.length === 0;
  const isEmpty = !isLoading && activities.length === 0;
  const isPaging = isLoading && activities.length > 0;
  const rowCount = hasMore || isPaging ? activities.length + 1 : activities.length;
  const rowProps = useMemo<ActivityVirtualRowData>(
    () => ({
      chain,
      activities,
      isPaging,
    }),
    [activities, chain, isPaging],
  );

  const handleRowsRendered = useCallback(
    (
      visibleRows: { startIndex: number; stopIndex: number },
      _allRows: { startIndex: number; stopIndex: number },
    ) => {
      if (!hasMore || isLoading) return;
      if (visibleRows.stopIndex >= activities.length - LOAD_MORE_THRESHOLD) {
        loadMore();
      }
    },
    [activities.length, hasMore, isLoading, loadMore],
  );

  return (
    <div className="flex h-[70vh] w-full flex-col overflow-hidden md:h-full">
      <div className="custom-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
        <div className="flex h-full flex-col" style={TABLE_SIZE_STYLE}>
          <ActivityHeader
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortByChange={setSortBy}
          />

          {isInitialLoading ? (
            <ActivitySkeletonRows />
          ) : isEmpty ? (
            <EmptyActivities />
          ) : (
            <VirtualList
              className="custom-scrollbar min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
              onRowsRendered={handleRowsRendered}
              rowComponent={ActivityVirtualRow}
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

function ActivityHeader({
  sortBy,
  sortDirection,
  onSortByChange,
}: {
  sortBy: ActivitySortBy | undefined;
  sortDirection: ActivitySortDirection;
  onSortByChange: (sortBy: ActivitySortBy | undefined, direction?: ActivitySortDirection) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="grid h-9 shrink-0 border-b border-divider bg-content1 text-[12px] font-medium text-text-muted"
      style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
    >
      {ACTIVITY_COLUMNS.map((col) => (
        <div
          key={col.key}
          className={cn("flex h-full items-center px-3", justifyClass(col.align))}
          style={{ letterSpacing: "-0.2px" }}
        >
          {ACTIVITY_SORT_BY_COLUMN[col.key] ? (
            <ActivitySortHeader
              label={t(col.labelKey)}
              sortBy={ACTIVITY_SORT_BY_COLUMN[col.key]}
              activeSortBy={sortBy}
              activeSortDirection={sortDirection}
              onSortByChange={onSortByChange}
            />
          ) : (
            t(col.labelKey)
          )}
        </div>
      ))}
    </div>
  );
}

function ActivitySortHeader({
  label,
  sortBy,
  activeSortBy,
  activeSortDirection,
  onSortByChange,
}: {
  label: string;
  sortBy: ActivitySortBy | undefined;
  activeSortBy: ActivitySortBy | undefined;
  activeSortDirection: ActivitySortDirection;
  onSortByChange: (sortBy: ActivitySortBy | undefined, direction?: ActivitySortDirection) => void;
}) {
  if (!sortBy) return label;

  const active = sortBy === activeSortBy;
  const nextDirection: ActivitySortDirection =
    active && activeSortDirection === "desc" ? "asc" : "desc";
  const shouldClearSort = active && activeSortDirection === "asc";
  const nextSortBy = shouldClearSort ? undefined : sortBy;
  const ariaLabel = shouldClearSort
    ? `Clear ${label} sort`
    : `Sort by ${label} ${nextDirection === "asc" ? "ascending" : "descending"}`;
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center bg-transparent p-0 font-inherit text-inherit",
      )}
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSortByChange(nextSortBy, shouldClearSort ? undefined : nextDirection);
      }}
    >
      <span>{label}</span>
      <SortArrow direction={active ? activeSortDirection : undefined} />
    </button>
  );
}

function SortArrow({ direction }: { direction?: ActivitySortDirection }) {
  return (
    <span className="ml-1 flex h-fit items-center justify-center" aria-hidden>
      <span className="flex flex-col justify-around">
        <span className={cn(direction === "asc" && "text-primary")}>
          <SortAscIcon />
        </span>
        <span className={cn("mt-px", direction === "desc" && "text-primary")}>
          <SortDescIcon />
        </span>
      </span>
    </span>
  );
}

interface ActivityVirtualRowData {
  chain: Chain;
  activities: Activity[];
  isPaging: boolean;
}

function ActivityVirtualRow({
  index,
  style,
  chain,
  activities,
  isPaging,
}: VirtualRowComponentProps<ActivityVirtualRowData>) {
  const activity = activities[index];
  if (!activity) {
    return (
      <div style={style}>
        <LoadMoreRow isLoading={isPaging} />
      </div>
    );
  }

  return (
    <div style={style}>
      <ActivityRow activity={activity} chain={chain} />
    </div>
  );
}

const ActivityRow = memo(function ActivityRow({
  activity,
  chain,
}: {
  activity: Activity;
  chain: Chain;
}) {
  const { t } = useTranslation();
  const primary = pickPrimaryToken(activity);
  const sideMeta = resolveTypeMeta(activity.type);
  const sideLabel = sideMeta.labelKey
    ? tKey(t, sideMeta.labelKey)
    : (sideMeta.fallbackLabel ?? "--");

  return (
    <div
      className="grid h-10 border-b border-divider text-[12px] transition-colors hover:bg-content2"
      style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
    >
      <AgeCell value={activity.time} />
      <div
        className={cn("flex items-center px-3 font-medium", justifyClass("left"), sideMeta.color)}
      >
        {sideLabel}
      </div>
      <div
        className={cn("flex items-center px-3 tabular-nums text-foreground", justifyClass("right"))}
        style={{ letterSpacing: "-0.2px" }}
      >
        {primary.priceInUsd ? formatPriceInUsd(primary.priceInUsd) : "--"}
      </div>
      <div
        className={cn("flex items-center px-3 tabular-nums text-foreground", justifyClass("right"))}
        style={{ letterSpacing: "-0.2px" }}
      >
        {formatAmount(primary.amount)}
      </div>
      <TotalUsdCell value={primary.amountInUsd} color={sideMeta.color} />
      <div
        className={cn("flex items-center px-3 tabular-nums text-foreground", justifyClass("right"))}
        style={{ letterSpacing: "-0.2px" }}
      >
        {formatGasFee(activity.gasFee, chain)}
      </div>
      <div className={cn("flex items-center px-3", justifyClass("right"))}>
        <TraderAddressActions chain={chain} address={activity.walletAddress} />
      </div>
      <div className={cn("flex items-center px-3", justifyClass("right"))}>
        <TxHashActions chain={chain} txHash={activity.txHash} />
      </div>
    </div>
  );
});

function TotalUsdCell({ value, color }: { value?: string; color: string }) {
  return (
    <div
      className={cn("flex h-full items-center px-3 tabular-nums", justifyClass("right"), color)}
      style={{ letterSpacing: "-0.2px" }}
    >
      {value ? formatAmountInUsd(value) : "--"}
    </div>
  );
}

const AgeCell = memo(function AgeCell({ value }: { value?: Date | string | number }) {
  const date = normalizeDate(value);
  const ageMs = useTickAge(date ?? Date.now());
  const ageText = date ? formatAge(ageMs) : "--";
  const fullTime = date ? date.toLocaleString() : null;

  const content = (
    <span className={cn(date ? "text-foreground" : "text-text-muted")}>{ageText}</span>
  );

  return (
    <div className={cn("flex items-center px-3 text-text-muted", justifyClass("left"))}>
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

const TraderAddressActions = memo(function TraderAddressActions({
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
    <div className="flex min-w-0 items-center justify-end gap-1">
      <TraderAddressCopyButton address={address} />
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

const TxHashActions = memo(function TxHashActions({
  chain,
  txHash,
}: {
  chain: Chain;
  txHash: string;
}) {
  const { t } = useTranslation();
  const explorer = useMemo(() => getTxExplorer(chain, txHash), [chain, txHash]);
  const explorerLabel = explorer
    ? t("trade.bottom_panel.open_in_explorer", {
        explorer: explorer.name,
      })
    : undefined;
  return (
    <div className="flex min-w-0 items-center justify-end gap-1">
      <HashCopyButton value={txHash} />
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

const TraderAddressCopyButton = memo(function TraderAddressCopyButton({
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

const HashCopyButton = memo(function HashCopyButton({ value }: { value: string }) {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const copiedResetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      copyToClipboard(value, () => {
        toast.success(t("extend.common.copied"));
        setCopied(true);
        if (copiedResetTimerRef.current) {
          clearTimeout(copiedResetTimerRef.current);
        }
        copiedResetTimerRef.current = setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
    },
    [copyToClipboard, t, value],
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
      onClick={handleCopy}
      aria-label={t("extend.common.copied")}
    >
      <span className="truncate font-mono text-[12px] font-medium">
        {truncateAddress(value, 4, 4)}
      </span>
      {copied ? (
        <CheckIcon className="h-3 w-3 shrink-0 text-positive" />
      ) : (
        <CopyIcon className="h-3 w-3 shrink-0 text-text-muted transition-colors group-hover:text-primary-200" />
      )}
    </button>
  );
});

/**
 * Pick the token that represents the listed token side of the activity.
 * Buy receives the token (`to`); sell spends the token (`from`).
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

function formatGasFee(gasFee: string | undefined, chain: Chain): string {
  if (!gasFee) return "--";
  const nativeDecimals = getNativeDecimals(chain);
  const nativeSymbol = getNativeSymbol(chain);
  const n = Number(gasFee) / Math.pow(10, nativeDecimals);
  if (!Number.isFinite(n)) return "--";
  if (n > 0 && n < 0.001) return `<0.001 ${nativeSymbol}`;
  return `${formatAmount(n)} ${nativeSymbol}`;
}

function getNativeDecimals(chain: Chain): number {
  switch (chain) {
    case "900900900":
    case "901901901":
    case "902902902":
      return 9;
    default:
      return 18;
  }
}

function getNativeSymbol(chain: Chain): string {
  switch (chain) {
    case "900900900":
    case "901901901":
    case "902902902":
      return "SOL";
    case "56":
    case "97":
      return "BNB";
    case "137":
      return "MATIC";
    case "43114":
      return "AVAX";
    case "8453":
    case "81457":
    case "42161":
    case "42170":
    case "421613":
    case "421614":
    case "1":
    default:
      return "ETH";
  }
}

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

function getTxExplorer(chain: Chain, txHash: string): { name: string; url: string } | undefined {
  const url = txExplorerUrl(chain, txHash);
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

function EmptyActivities() {
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

function ActivitySkeletonRows() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, row) => (
        <div
          key={row}
          className="grid h-10 border-b border-divider"
          style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
        >
          {ACTIVITY_COLUMNS.map((col, idx) => (
            <div key={col.key} className="flex flex-col justify-center px-3">
              <div
                className={cn(
                  "h-3 animate-pulse rounded-sm bg-content3",
                  idx < 2 ? "w-14" : "ml-auto w-20",
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function justifyClass(align: "left" | "right" | "center" | undefined) {
  if (align === "right") return "justify-end text-right";
  if (align === "center") return "justify-center text-center";
  return "justify-start text-left";
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

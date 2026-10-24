"use client";

import { useTokenQuery } from "@liberfi.io/react";
import type { Chain, Token } from "@liberfi.io/types";
import {
  Avatar,
  CheckIcon,
  cn,
  CopyIcon,
  StyledTooltip,
  toast,
  useCopyToClipboard,
  VirtualList,
  XCloseIcon,
  type VirtualRowComponentProps,
} from "@liberfi.io/ui";
import { useTokenDevTokensListScript } from "@liberfi.io/ui-tokens";
import { formatAmount, formatAmountInUsd, formatPercent, truncateAddress } from "@liberfi.io/utils";
import { useTick } from "@liberfi.io/hooks";
import { tokenDetailRoute } from "../../../../application/routes";
import { useLocalizedTimeFormatter, useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../../application/t";
import { MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface BottomDevTokensTableProps {
  chain: Chain;
  address: string;
}

const ROW_HEIGHT = 40;
const VIRTUAL_OVERSCAN = 72;
const LOAD_MORE_THRESHOLD = 30;
const TABLE_WIDTH = 1280;
const TABLE_SIZE_STYLE = { minWidth: TABLE_WIDTH, width: "100%" };
const GRID_TEMPLATE_COLUMNS =
  "minmax(210px, 210fr) minmax(90px, 90fr) minmax(90px, 90fr) minmax(120px, 120fr) minmax(130px, 130fr) minmax(130px, 130fr) minmax(120px, 120fr) minmax(100px, 100fr) minmax(120px, 120fr) minmax(110px, 110fr)";

interface DevTokenColumn {
  key: string;
  labelKey: string;
  align?: "left" | "right" | "center";
}

const DEV_TOKEN_COLUMNS: ReadonlyArray<DevTokenColumn> = [
  {
    key: "token",
    labelKey: "trade.bottom_panel.dev_tokens_table.token",
    align: "left",
  },
  {
    key: "created",
    labelKey: "trade.bottom_panel.dev_tokens_table.created",
    align: "right",
  },
  {
    key: "migrated",
    labelKey: "trade.bottom_panel.dev_tokens_table.migrated",
    align: "center",
  },
  {
    key: "total_fee",
    labelKey: "trade.bottom_panel.dev_tokens_table.total_fee",
    align: "right",
  },
  {
    key: "ath",
    labelKey: "trade.bottom_panel.dev_tokens_table.ath",
    align: "right",
  },
  {
    key: "market_cap",
    labelKey: "trade.bottom_panel.dev_tokens_table.market_cap",
    align: "right",
  },
  {
    key: "liquidity",
    labelKey: "trade.bottom_panel.dev_tokens_table.liquidity",
    align: "right",
  },
  {
    key: "holders",
    labelKey: "trade.bottom_panel.dev_tokens_table.holders",
    align: "right",
  },
  {
    key: "volume_1h",
    labelKey: "trade.bottom_panel.dev_tokens_table.volume_1h",
    align: "right",
  },
  {
    key: "bundled",
    labelKey: "trade.bottom_panel.dev_tokens_table.bundled",
    align: "right",
  },
];

export function BottomDevTokensTable({ chain, address }: BottomDevTokensTableProps) {
  const { data: currentToken, isLoading: isTokenLoading } = useTokenQuery({
    chain,
    address,
  });
  const creator = resolveDeveloperAddress(currentToken);

  const { tokens, isLoading, hasMore, loadMore } = useTokenDevTokensListScript({
    chain,
    creator,
    limit: 50,
  });
  const isInitialLoading =
    isTokenLoading || (isLoading && creator !== undefined && tokens.length === 0);
  const isEmpty = !isTokenLoading && !isLoading && tokens.length === 0;
  const isPaging = isLoading && tokens.length > 0;
  const rowCount = hasMore || isPaging ? tokens.length + 1 : tokens.length;
  const rowProps = useMemo<DevTokenVirtualRowData>(
    () => ({
      chain,
      tokens,
      isPaging,
    }),
    [chain, isPaging, tokens],
  );

  const handleRowsRendered = useCallback(
    (
      visibleRows: { startIndex: number; stopIndex: number },
      _allRows: { startIndex: number; stopIndex: number },
    ) => {
      if (!hasMore || isLoading) return;
      if (visibleRows.stopIndex >= tokens.length - LOAD_MORE_THRESHOLD) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore, tokens.length],
  );

  return (
    <div className="flex h-[70vh] w-full flex-col overflow-hidden md:h-full">
      <div className="custom-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
        <div className="flex h-full flex-col" style={TABLE_SIZE_STYLE}>
          <DevTokenHeader />

          {isInitialLoading ? (
            <DevTokensSkeletonRows />
          ) : !creator ? (
            <EmptyDevTokens messageKey="trade.bottom_panel.dev_tokens_table.no_creator" />
          ) : isEmpty ? (
            <EmptyDevTokens />
          ) : (
            <VirtualList
              className="custom-scrollbar min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
              onRowsRendered={handleRowsRendered}
              rowComponent={DevTokenVirtualRow}
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

function DevTokenHeader() {
  const { t } = useTranslation();
  return (
    <div
      className="grid h-9 shrink-0 border-b border-divider bg-content1 text-[12px] font-medium text-text-muted"
      style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
    >
      {DEV_TOKEN_COLUMNS.map((col) => (
        <div
          key={col.key}
          className={cn("flex h-full items-center px-3", justifyClass(col.align))}
          style={{ letterSpacing: "-0.2px" }}
        >
          {tKey(t, col.labelKey)}
        </div>
      ))}
    </div>
  );
}

interface DevTokenVirtualRowData {
  chain: Chain;
  tokens: Token[];
  isPaging: boolean;
}

function DevTokenVirtualRow({
  index,
  style,
  chain,
  tokens,
  isPaging,
}: VirtualRowComponentProps<DevTokenVirtualRowData>) {
  const token = tokens[index];
  if (!token) {
    return (
      <div style={style}>
        <LoadMoreRow isLoading={isPaging} />
      </div>
    );
  }

  return (
    <div style={style}>
      <DevTokenRow chain={chain} token={token} />
    </div>
  );
}

const DevTokenRow = memo(function DevTokenRow({ chain, token }: { chain: Chain; token: Token }) {
  const md = token.marketData;
  const stats1h = token.stats?.["1h"];
  const migrated = !!(
    token.migratedTo?.protocolFamily ||
    token.migratedTo?.poolAddress ||
    token.migratedTo?.migratedAt
  );

  return (
    <div
      className="grid h-10 border-b border-divider text-[12px] transition-colors hover:bg-content2"
      style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
    >
      <TokenIdentityCell chain={chain} token={token} />
      <AgeCell value={token.createdAt} />
      <MigratedCell migrated={migrated} />
      <TextCell align="right" value="--" muted />
      <UsdCell value={md?.athMarketCapInUsd} />
      <UsdCell value={md?.marketCapInUsd} />
      <UsdCell value={md?.maxPoolTvlInUsd ?? md?.tvlInUsd} />
      <TextCell
        align="right"
        value={md?.holders === undefined ? "--" : formatAmount(md.holders)}
        muted={md?.holders === undefined}
      />
      <UsdCell value={stats1h?.volumesInUsd} />
      <PercentCell value={md?.bundleHoldingsRatio} />
    </div>
  );
});

const TokenIdentityCell = memo(function TokenIdentityCell({
  chain,
  token,
}: {
  chain: Chain;
  token: Token;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-3">
      <a href={tokenDetailRoute(chain, token.address)} className="shrink-0">
        <Avatar
          src={token.image ?? undefined}
          name={(token.symbol || token.name || token.address).slice(0, 1)}
          className="size-6 shrink-0 bg-default-200 text-[10px] text-text-secondary"
          showFallback
        />
      </a>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <a
          href={tokenDetailRoute(chain, token.address)}
          className="min-w-0 truncate text-[12px] font-medium leading-4 text-foreground transition-colors hover:text-primary-200"
        >
          {token.symbol || token.name || truncateAddress(token.address, 4, 4)}
        </a>
        <div className="shrink-0 text-[11px] leading-4 text-text-muted">
          <TokenAddressCopyButton address={token.address} />
        </div>
      </div>
    </div>
  );
});

const TokenAddressCopyButton = memo(function TokenAddressCopyButton({
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
      className="group inline-flex min-w-0 cursor-pointer items-center gap-1 font-mono text-text-muted transition-colors hover:text-primary-200"
      onClick={handleCopyAddress}
      aria-label={t("tokens.copied.address")}
    >
      <span>{truncateAddress(address, 4, 4)}</span>
      {copied ? (
        <CheckIcon className="h-3 w-3 shrink-0 text-positive" />
      ) : (
        <CopyIcon className="h-3 w-3 shrink-0 text-text-muted transition-colors group-hover:text-primary-200" />
      )}
    </button>
  );
});

const AgeCell = memo(function AgeCell({ value }: { value?: Date | string | number }) {
  const { formatAge, formatUnit } = useLocalizedTimeFormatter();
  const date = normalizeDate(value);
  const [now, setNow] = useState(Date.now());
  useTick(({ now: nextNow }) => setNow(nextNow), 1000);
  const ageText = date ? formatTimeDistance(date, now, formatAge, formatUnit) : "--";
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

const MigratedCell = memo(function MigratedCell({ migrated }: { migrated: boolean }) {
  return (
    <div className="flex items-center justify-center px-3">
      {migrated ? (
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-success-500" />
      ) : (
        <XCloseIcon className="h-3.5 w-3.5 shrink-0 text-danger-500" />
      )}
    </div>
  );
});

const UsdCell = memo(function UsdCell({ value }: { value?: string | number }) {
  return (
    <TextCell
      align="right"
      value={value === undefined || value === "" ? "--" : formatAmountInUsd(value)}
      muted={value === undefined || value === ""}
    />
  );
});

const PercentCell = memo(function PercentCell({ value }: { value?: string | number }) {
  const text = formatRatio(value);
  return <TextCell align="right" value={text} muted={text === "--"} />;
});

const TextCell = memo(function TextCell({
  value,
  align = "left",
  muted,
}: {
  value: string;
  align?: "left" | "right" | "center";
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center px-3 tabular-nums",
        justifyClass(align),
        muted ? "text-text-muted" : "text-foreground",
      )}
    >
      {value}
    </div>
  );
});

function EmptyDevTokens({ messageKey }: { messageKey?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-1 items-center justify-center py-16 text-[12px] text-text-muted"
      role="status"
    >
      {tKey(t, messageKey ?? "trade.bottom_panel.no_data")}
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

function DevTokensSkeletonRows() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, row) => (
        <div
          key={row}
          className="grid h-12 border-b border-divider"
          style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
        >
          {DEV_TOKEN_COLUMNS.map((col, idx) => (
            <div key={col.key} className="flex flex-col justify-center px-3">
              <div
                className={cn(
                  "h-3 animate-pulse rounded-sm bg-content3",
                  idx === 0 ? "w-32" : "ml-auto w-16",
                )}
              />
              {idx === 0 ? (
                <div className="mt-2 h-2 w-24 animate-pulse rounded-sm bg-content3/70" />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
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

function formatRatio(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "--";
  const n = Number(value);
  if (Number.isNaN(n)) return "--";
  return formatPercent(n);
}

function formatTimeDistance(
  date: Date,
  now: number,
  formatAge: (ageMilliseconds: number) => string,
  formatUnit: (value: number, unit: "second") => string,
): string {
  const target = date.getTime();
  if (target > now) {
    const remainingMs = target - now;
    if (remainingMs < 10_000) {
      return `T-${formatUnit(Math.ceil(remainingMs / 1000), "second")}`;
    }
    return `T-${formatAge(remainingMs)}`;
  }
  return formatAge(now - target);
}

function resolveDeveloperAddress(token: Token | undefined): string | undefined {
  return token?.creators?.find((creator) => creator.address)?.address ?? token?.developerAddress;
}

function justifyClass(align: "left" | "right" | "center" | undefined) {
  if (align === "right") return "justify-end text-right";
  if (align === "center") return "justify-center text-center";
  return "justify-start text-left";
}

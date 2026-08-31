"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTokensQuery, useWalletPortfolioPnlsQuery } from "@liberfi.io/react";
import { usePortfolioNetWorthTokensScript } from "@liberfi.io/ui-portfolio";
import type { Chain, Portfolio, PortfolioPnl, Token } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import {
  formatAmount,
  formatAmountInUsd,
  formatPercent,
  formatPriceInUsd,
} from "@liberfi.io/utils";
import { useTranslation } from "@liberfi.io/i18n";
import { tokenDetailRoute } from "../../../../application/routes";
import {
  alignClass,
  EmptyBody,
  TableShell,
  type BottomTableColumn,
} from "../../token-detail/bottom-tables/table-shell";
import { PortfolioAssetsTableSkeleton } from "../skeletons/PortfolioAssetsTableSkeleton";

const COLUMNS: ReadonlyArray<BottomTableColumn> = [
  {
    key: "token",
    labelKey: "portfolio.headers.token",
    width: "w-[26%]",
    align: "left",
  },
  {
    key: "balance",
    labelKey: "portfolio.headers.balance",
    width: "w-[16%]",
    align: "right",
  },
  {
    key: "value",
    labelKey: "portfolio.headers.value",
    width: "w-[14%]",
    align: "right",
  },
  {
    key: "price",
    labelKey: "portfolio.headers.price",
    width: "w-[14%]",
    align: "right",
  },
  {
    key: "change24h",
    labelKey: "portfolio.headers.change24h",
    width: "w-[12%]",
    align: "right",
  },
  {
    key: "pnl",
    labelKey: "portfolio.headers.pnl",
    width: "w-[18%]",
    align: "right",
  },
];

export interface PortfolioAssetsTableProps {
  chain: Chain;
  address: string;
}

/**
 * Per-asset holdings table for the wallet.
 *
 * Data flow:
 *   1. `usePortfolioNetWorthTokensScript` paginates `/v2/wallet/{chain}/{address}/net-worth`
 *      so we get balance + value per token with cursor pagination.
 *   2. `useWalletPortfolioPnlsQuery` provides per-token unrealized/total PnL
 *      for the same wallet (single page; the PnL endpoint is much narrower
 *      than net-worth and is fine to fetch in one shot for the visible
 *      window).
 *   3. `useTokensQuery` enriches each address with the *up-to-date* token
 *      metadata — image, current price, 24h change — from the canonical
 *      tokens API. Net-worth gives us the holding amount, but token-level
 *      market metadata (especially the 24h price-change percentage) lives
 *      on the `Token` resource.
 *
 * Joining on `token.address` (chain-scoped) gives one merged row per
 * holding. Rows are stable across re-renders (key = token address).
 */
export function PortfolioAssetsTable({ chain, address }: PortfolioAssetsTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const enabled = !!address;

  // Paged net-worth: holding amount + value
  const {
    data: portfolios,
    isLoading: portfoliosLoading,
    hasMore,
    loadMore,
  } = usePortfolioNetWorthTokensScript({
    chain,
    address,
    limit: 50,
  });

  // Per-token PnL — single page covering the top positions. Server returns
  // them sorted by total profit desc by default; that's the right order for
  // showing PnL alongside the holding list.
  const { data: pnlsData } = useWalletPortfolioPnlsQuery(
    { chain, address, limit: 100 },
    { enabled },
  );

  // Address list of currently visible holdings — used to enrich with
  // canonical token metadata. Sorted to keep `useTokensQuery`'s cache key
  // stable across re-orderings.
  const tokenAddresses = useMemo(() => {
    if (!portfolios) return [];
    return [...new Set(portfolios.portfolios.map((p) => p.address))].sort();
  }, [portfolios]);

  // `isLoading` here = `isPending && isFetching` per React Query's
  // semantics. It is true only on the very first fetch — subsequent
  // refetches keep the previous `data` and flip just `isFetching`,
  // so the skeleton does not flash on every poll, only on the
  // initial enrichment round-trip after `portfolios` arrives.
  const { data: tokens, isLoading: tokensLoading } = useTokensQuery(
    { chain, addresses: tokenAddresses },
    { enabled: enabled && tokenAddresses.length > 0 },
  );

  // Index PnL + Tokens by address for O(1) row lookup
  const pnlByAddress = useMemo(() => {
    const map = new Map<string, PortfolioPnl>();
    pnlsData?.portfolios.forEach((p) => map.set(p.address, p));
    return map;
  }, [pnlsData]);

  const tokenByAddress = useMemo(() => {
    const map = new Map<string, Token>();
    tokens?.forEach((t) => map.set(t.address, t));
    return map;
  }, [tokens]);

  const rows = portfolios?.portfolios ?? [];
  // Skeleton window: until BOTH the holdings list and the token
  // enrichment have resolved. Without the second condition rows would
  // flash on screen with placeholder symbols / missing 24h-change /
  // missing PnL the moment portfolios returns, then jump to the
  // enriched values once the tokens query lands — the user sees the
  // page "shake".
  const isInitialLoading =
    (portfoliosLoading && rows.length === 0) || (tokenAddresses.length > 0 && tokensLoading);
  const isEmpty = !portfoliosLoading && rows.length === 0;

  if (!enabled) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-text-muted">
        {t("portfolio.allocation.noWallet")}
      </div>
    );
  }

  if (isInitialLoading) {
    return <PortfolioAssetsTableSkeleton columns={COLUMNS} />;
  }

  return (
    <TableShell
      columns={COLUMNS}
      minWidth="min-w-[820px]"
      infiniteScroll={{
        hasMore,
        isLoading: portfoliosLoading,
        onLoadMore: loadMore,
      }}
    >
      <tbody>
        {rows.map((portfolio) => (
          <AssetRow
            key={portfolio.address}
            portfolio={portfolio}
            pnl={pnlByAddress.get(portfolio.address)}
            token={tokenByAddress.get(portfolio.address)}
            onClick={() => {
              router.push(tokenDetailRoute(chain, portfolio.address));
            }}
          />
        ))}
      </tbody>
      {isEmpty ? <EmptyBody colSpan={COLUMNS.length} messageKey="portfolio.noAssets" /> : null}
    </TableShell>
  );
}

interface AssetRowProps {
  portfolio: Portfolio;
  pnl?: PortfolioPnl;
  token?: Token;
  onClick: () => void;
}

function AssetRow({ portfolio, pnl, token, onClick }: AssetRowProps) {
  const symbol = token?.symbol ?? portfolio.symbol;
  const name = token?.name ?? portfolio.name;
  const imageUrl = token?.image ?? portfolio.image;
  const priceInUsd = token?.marketData?.priceInUsd ?? portfolio.priceInUsd;
  const change24h = token?.stats?.["24h"]?.priceChange;
  const profitInUsd = pnl?.totalProfitInUsd;
  const profitRatio = pnl?.totalProfitRatio;
  // USD value resolution order:
  //   1. Server-provided `amountInUsd` — preferred when present (it
  //      reflects the upstream provider's pricing decision).
  //   2. Client-side `amount × priceInUsd` — fallback when the
  //      net-worth row omits the USD value but we still have a price
  //      from the enriched token lookup. Common for newly-listed
  //      memecoins where net-worth lags the price feed.
  //   3. `null` — neither path produced a finite value, render "--".
  const valueInUsd = resolveValueInUsd(portfolio.amountInUsd, portfolio.amount, priceInUsd);

  return (
    <tr
      onClick={onClick}
      className="h-12 cursor-pointer border-b border-default-50 transition-colors hover:bg-content2"
    >
      <td className={cn("px-3 align-middle", alignClass("left"))}>
        <div className="flex items-center gap-2">
          <TokenAvatar imageUrl={imageUrl} symbol={symbol} address={portfolio.address} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {symbol || "—"}
            </span>
            <span className="truncate text-[11px] text-text-muted">{name || "—"}</span>
          </div>
        </div>
      </td>
      <td
        className={cn("px-3 align-middle tabular-nums text-foreground", alignClass("right"))}
        style={{ letterSpacing: "-0.2px" }}
      >
        {formatAmount(portfolio.amount)}
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums font-medium text-foreground",
          alignClass("right"),
        )}
      >
        {valueInUsd != null ? formatAmountInUsd(valueInUsd) : "--"}
      </td>
      <td className={cn("px-3 align-middle tabular-nums text-text-muted", alignClass("right"))}>
        {priceInUsd ? formatPriceInUsd(priceInUsd) : "--"}
      </td>
      <td
        className={cn(
          "px-3 align-middle tabular-nums",
          alignClass("right"),
          changeColor(change24h),
        )}
      >
        {change24h ? formatPercent(change24h, { showPlusGtThanZero: true }) : "--"}
      </td>
      <td className={cn("px-3 align-middle tabular-nums", alignClass("right"))}>
        {profitInUsd ? (
          <span
            className={cn("inline-flex flex-col items-end leading-tight", profitColor(profitInUsd))}
          >
            <span className="font-semibold">
              {formatAmountInUsd(profitInUsd, { showPlusGtThanZero: true })}
            </span>
            {profitRatio ? (
              <span className="text-[11px]">
                {formatPercent(profitRatio, { showPlusGtThanZero: true })}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-text-muted">--</span>
        )}
      </td>
    </tr>
  );
}

/**
 * Resolve the USD value of a holding. Returns `null` when neither the
 * server-provided value nor an `amount × price` calculation produces a
 * finite, non-negative number.
 *
 * The fallback path matters in practice: `/v2/wallet/{chain}/{addr}/net-worth`
 * sometimes omits `amountInUsd` for tokens whose pricing data is on a
 * separate provider, but the same tokens are returned with a fresh price
 * by `useTokensQuery`. Joining the two unlocks the full holding value
 * even when the net-worth response is partially priced.
 */
function resolveValueInUsd(
  amountInUsd: string | undefined,
  amount: string | undefined,
  priceInUsd: string | undefined,
): string | null {
  if (amountInUsd != null && amountInUsd !== "") {
    const n = parseFloat(amountInUsd);
    if (Number.isFinite(n) && n > 0) return amountInUsd;
  }
  if (amount && priceInUsd) {
    const a = parseFloat(amount);
    const p = parseFloat(priceInUsd);
    if (Number.isFinite(a) && Number.isFinite(p) && a > 0 && p > 0) {
      return (a * p).toString();
    }
  }
  return null;
}

/** Color helper for the 24h change column. */
function changeColor(value?: string): string {
  if (!value) return "text-text-muted";
  const n = parseFloat(value);
  if (n > 0) return "text-positive";
  if (n < 0) return "text-negative";
  return "text-text-muted";
}

/** Color helper for the PnL column. */
function profitColor(value?: string): string {
  if (!value) return "text-text-muted";
  const n = parseFloat(value);
  if (n > 0) return "text-positive";
  if (n < 0) return "text-negative";
  return "text-text-muted";
}

interface TokenAvatarProps {
  imageUrl?: string;
  symbol?: string;
  address: string;
}

/**
 * 24×24 round avatar for a token cell.
 *
 * Falls back to the symbol's first letter on a generated background when
 * the API doesn't return an image URL — this is common for long-tail
 * memecoins. The fallback color is derived from the address so the same
 * token always renders with the same fallback color across the page.
 */
function TokenAvatar({ imageUrl, symbol, address }: TokenAvatarProps) {
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

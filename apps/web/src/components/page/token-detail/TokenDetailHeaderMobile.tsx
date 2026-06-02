"use client";

import { formatAmountInUsd, formatMCapInUsd, formatPriceInUsd } from "@liberfi.io/utils";
import { Skeleton } from "@heroui/react";
import { useTickAge } from "@liberfi.io/hooks";
import { useTokenQuery } from "@liberfi.io/react";
import type { Chain, Token } from "@liberfi.io/types";
import {
  CopyIcon,
  DiscordIcon,
  Link,
  SearchIcon,
  StyledTooltip,
  TelegramIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  TwitterIcon,
  WebsiteIcon,
  cn,
  toast,
  useCopyToClipboard,
} from "@liberfi.io/ui";
import { TokenAvatar } from "@liberfi.io/ui-tokens";
import {
  formatAge,
  formatPercent,
  SafeBigNumber,
  searchTwitterUrl,
} from "@liberfi.io/utils";
import { useTranslation } from "@liberfi/ui-base";
import { formatShortAddress } from "@liberfi/ui-dex/libs";
import { MouseEvent, useCallback, useMemo } from "react";

export interface TokenDetailHeaderMobileProps {
  chain: Chain;
  address: string;
}

/**
 * Mobile-optimised token detail header — a compact two-row variant of the
 * desktop {@link TokenDetailHeader}, modelled on GMGN's mobile token page
 * (e.g. https://gmgn.ai/sol/token/HZ1Jov…CQBCt3 at 390×844):
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │ [Avatar 40] Symbol 18/600  Name 12/400  ⧉     $0.0405  │
 *   │             Age · 4abc…1234 · 🌐 X Tg Dc 🔍            │
 *   │                                  市值 $405.19M ▲ 2.04% │
 *   └────────────────────────────────────────────────────────┘
 *
 * The big right-hand number is **price** (the trader's primary input);
 * market cap demotes to a labelled secondary value adjacent to the 24h
 * % change. This matches the user's request — see the conversation
 * "Token Header 中的大写是价格，涨跌旁边小写是市值".
 *
 * Reuses the exact same primitives as the desktop header
 * ({@link TokenAvatar}, {@link StyledTooltip}, social `<Link>` icons,
 * `formatPriceInUsd`, `formatPercent`, bullish/bearish colour tokens) so
 * theming, copy-to-clipboard, and tooltip behaviour all stay consistent
 * across breakpoints. The only differences are layout (two stacked rows
 * vs. desktop's single 72px row) and the stat strip — on mobile the
 * `Market Cap · Liquidity · Volume · Holders · Supply` row lives in the
 * `SidebarVolumeStats` block below and the wider stat grid lives in
 * `SidebarTokenAudit` + `SidebarBasicInfo`, keeping this header focused
 * on identity and price.
 */
export function TokenDetailHeaderMobile({
  chain,
  address,
}: TokenDetailHeaderMobileProps) {
  const { data: token, isLoading } = useTokenQuery({ chain, address });

  if (!token || isLoading) return <HeaderSkeleton />;
  return <Content token={token} />;
}

function Content({ token }: { token: Token }) {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  const md = token.marketData;
  const stats24h = token.stats?.["24h"];
  const priceChange = stats24h?.priceChange;

  const priceChangeAbs = useMemo(
    () =>
      priceChange ? new SafeBigNumber(priceChange).abs().toString() : undefined,
    [priceChange],
  );
  const bullish = useMemo(
    () => !priceChange || new SafeBigNumber(priceChange).gte(0),
    [priceChange],
  );

  // Live-updating age — formats as "2h" / "3d" / etc.
  const ageMs = useTickAge(token.createdAt ?? Date.now());
  const ageText = token.createdAt ? formatAge(ageMs) : null;
  const fullCreatedAt = useMemo(() => {
    const c = token.createdAt;
    if (!c) return null;
    return (c instanceof Date ? c : new Date(c)).toLocaleString();
  }, [token.createdAt]);

  const handleCopyAddress = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      copyToClipboard(token.address, () =>
        toast.success(
          t("extend.common.copied_token_address", {
            symbol: token.symbol,
          }),
        ),
      );
    },
    [copyToClipboard, token.address, token.symbol, t],
  );

  const socials = token.socialMedias ?? {};

  return (
    <header className="flex flex-col gap-1 border-b border-divider bg-content1 px-3 py-2.5">
      {/* Row 1 — identity (avatar + symbol + name + copy) | price column */}
      <div className="flex items-center gap-3">
        <TokenAvatar
          token={token}
          showProgress={false}
          className="h-10 w-10 flex-none"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div
            className="group flex min-w-0 cursor-pointer items-center gap-1.5"
            onClick={handleCopyAddress}
          >
            <span className="whitespace-nowrap text-[18px] font-semibold leading-[22px] text-foreground">
              {token.symbol}
            </span>
            {token.name && token.name !== token.symbol && (
              <span className="min-w-0 truncate text-[12px] font-normal leading-4 text-neutral transition-colors group-hover:text-primary-200">
                {token.name}
              </span>
            )}
            <CopyIcon className="h-[12px] w-[12px] flex-none text-neutral transition-colors group-hover:text-primary-200" />
          </div>

          {/* Row 2 — age · address · socials, in a single horizontally
              scrollable strip so we never blow out the viewport on
              long social lists. */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto text-[12px] leading-4">
            {ageText && (
              <StyledTooltip content={fullCreatedAt}>
                <span className="cursor-default whitespace-nowrap font-medium text-primary-200">
                  {ageText}
                </span>
              </StyledTooltip>
            )}
            <span
              className="cursor-pointer whitespace-nowrap font-mono text-neutral transition-colors hover:text-primary-200"
              onClick={handleCopyAddress}
            >
              {formatShortAddress(token.address)}
            </span>
            {socials.website && (
              <SocialLink href={socials.website}>
                <WebsiteIcon className="h-3.5 w-3.5" />
              </SocialLink>
            )}
            {socials.twitter && (
              <SocialLink href={socials.twitter}>
                <TwitterIcon className="h-3.5 w-3.5" />
              </SocialLink>
            )}
            {socials.telegram && (
              <SocialLink href={socials.telegram}>
                <TelegramIcon className="h-3.5 w-3.5" />
              </SocialLink>
            )}
            {socials.discord && (
              <SocialLink href={socials.discord}>
                <DiscordIcon className="h-3.5 w-3.5" />
              </SocialLink>
            )}
            <SocialLink
              href={searchTwitterUrl(`${token.symbol} OR ${token.address}`)}
            >
              <SearchIcon className="h-3.5 w-3.5" />
            </SocialLink>
          </div>
        </div>

        {/* Right column — price (primary), labelled market cap + 24h
            change below. Price is the trader-relevant value, so it gets
            the 18px/600 treatment; market cap is a secondary stat and
            sits in the small row with a "市值" / "MCap" label so it is
            never confused with the price value. */}
        <div className="flex shrink-0 flex-col items-end justify-center gap-0.5">
          <span className="whitespace-nowrap text-[18px] font-semibold leading-[22px] tabular-nums text-foreground">
            {formatPriceInUsd(md?.priceInUsd ?? "")}
          </span>
          <div className="flex items-center gap-1.5 text-[12px] leading-4 tabular-nums">
            <span className="text-default-500">
              {t("extend.token_list.attributes.market_cap")}
            </span>
            <span className="text-default-700">
              {formatMCapInUsd(md?.marketCapInUsd ?? "")}
            </span>
            {priceChange !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5",
                  bullish ? "text-bullish" : "text-bearish",
                )}
              >
                {bullish ? (
                  <TriangleUpIcon width={8} height={8} />
                ) : (
                  <TriangleDownIcon width={8} height={8} />
                )}
                <span>{formatPercent(priceChangeAbs)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function SocialLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="flex items-center text-neutral transition-colors hover:text-primary-200"
    >
      {children}
    </Link>
  );
}

function HeaderSkeleton() {
  return (
    <header className="flex flex-col gap-1 border-b border-divider bg-content1 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </header>
  );
}

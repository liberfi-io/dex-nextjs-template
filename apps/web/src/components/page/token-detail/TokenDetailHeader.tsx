import { formatAmountUSD, formatPriceUSD } from "src/libs/formatters";
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
  formatAmount,
  formatPercent,
  SafeBigNumber,
  searchTwitterUrl,
} from "@liberfi.io/utils";
import { useTranslation } from "@liberfi/ui-base";
import { formatShortAddress } from "@liberfi/ui-dex/libs";
import { MouseEvent, useCallback, useMemo } from "react";

export interface TokenDetailHeaderProps {
  chain: Chain;
  address: string;
}

/**
 * Token detail page header.
 *
 * Layout (mirrors the home trending list — see `token-cell.ui.tsx`,
 * `token-price-cell.ui.tsx`, `token-volumes-cell.ui.tsx` in
 * `@liberfi.io/ui-tokens`):
 *
 *   [Avatar 40] | [Symbol 20/600] [Name 14/400 neutral, hover primary-200]
 *               | [Age tooltip] [Address neutral, hover primary] [Socials]
 *               | [Price 20/600 + price-change icon/percent (bullish/bearish)]
 *               | [Market Cap] [Liquidity] [Vol 24h] [Supply] [Holders]
 *
 * Stat values use `font-medium` (500) for emphasis; labels use `default-700`.
 * All colour values come from the local HeroUI palette tokens; no hex.
 */
export function TokenDetailHeader({ chain, address }: TokenDetailHeaderProps) {
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
  const volume24h = stats24h?.volumesInUsd;

  const priceChangeAbs = useMemo(
    () =>
      priceChange ? new SafeBigNumber(priceChange).abs().toString() : undefined,
    [priceChange],
  );
  const bullish = useMemo(
    () => !priceChange || new SafeBigNumber(priceChange).gte(0),
    [priceChange],
  );

  // age — tick every second; formatted "2h", with full-time tooltip
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
    <header
      className={[
        // h=72 — balanced height for two-line identity + price/change column
        "flex h-[72px] shrink-0 items-center gap-4",
        // surface — content1 + divider
        "border-b border-divider bg-content1",
        // padding 0 20px 0 16px
        "pl-4 pr-5",
      ].join(" ")}
    >
      {/* Identity: avatar + name block */}
      <div className="flex shrink-0 items-center gap-3">
        <TokenAvatar
          token={token}
          showProgress={false}
          className="h-10 w-10 flex-none"
        />

        <div className="flex min-w-0 flex-col gap-1">
          {/* Row 1: symbol + name + copy — entire row copies address on click */}
          <div
            className="group flex min-w-0 cursor-pointer items-center gap-1.5"
            onClick={handleCopyAddress}
          >
            <span className="whitespace-nowrap text-[20px] font-semibold leading-6 text-foreground">
              {token.symbol}
            </span>
            {token.name && token.name !== token.symbol && (
              <span className="max-w-[200px] truncate text-[14px] font-normal leading-6 text-neutral transition-colors group-hover:text-primary-200">
                {token.name}
              </span>
            )}
            <CopyIcon className="h-[14px] w-[14px] flex-none text-neutral transition-colors group-hover:text-primary-200" />
          </div>

          {/* Row 2: age (with full-time tooltip) · address · socials — all 12px */}
          <div className="flex items-center gap-2 text-xs leading-4">
            {ageText && (
              <StyledTooltip content={fullCreatedAt}>
                <span className="cursor-default whitespace-nowrap font-medium text-primary-200">
                  {ageText}
                </span>
              </StyledTooltip>
            )}
            <span
              className="cursor-pointer whitespace-nowrap text-neutral transition-colors hover:text-primary-200"
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
      </div>

      {/* Hero price + 24h change — modelled on TokenPriceCell */}
      <div className="flex shrink-0 flex-col justify-center gap-0.5">
        <span className="whitespace-nowrap text-[20px] font-semibold leading-6 tabular-nums text-foreground">
          {formatPriceUSD(md?.priceInUsd ?? "")}
        </span>
        {priceChange !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs tabular-nums",
              bullish ? "text-bullish" : "text-bearish",
            )}
          >
            {bullish ? (
              <TriangleUpIcon width={10} height={10} />
            ) : (
              <TriangleDownIcon width={10} height={10} />
            )}
            <span>{formatPercent(priceChangeAbs)}</span>
          </span>
        )}
      </div>

      {/* Stats group — horizontally scrollable on overflow */}
      <div className="custom-scrollbar flex min-w-0 shrink items-center gap-5 overflow-x-auto">
        <Stat
          label={t("extend.token_list.attributes.market_cap")}
          value={formatAmountUSD(md?.marketCapInUsd ?? "")}
        />
        <Stat
          label={t("extend.token_list.attributes.liquidity")}
          value={formatAmountUSD(md?.tvlInUsd ?? "")}
        />
        <Stat
          label={`24h ${t("extend.token_list.attributes.volume")}`}
          value={formatAmountUSD(volume24h ?? "")}
        />
        <Stat
          label={t("extend.token_list.attributes.supply")}
          value={formatAmount(md?.totalSupply ?? "")}
        />
        <Stat
          label={t("extend.token_list.attributes.holders")}
          value={formatAmount(md?.holders ?? "")}
        />
      </div>
    </header>
  );
}

/**
 * Two-line stat cell — label (12px / 400 / default-700) on top, value
 * (14px / 500 / foreground) on bottom.
 */
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-[2px] whitespace-nowrap">
      <span className="text-[12px] font-normal leading-4 text-default-700">{label}</span>
      <span className="text-[14px] font-medium leading-[18px] tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
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
    <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-divider bg-content1 pl-4 pr-5">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-3 w-40 rounded" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
      <div className="flex items-center gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </header>
  );
}

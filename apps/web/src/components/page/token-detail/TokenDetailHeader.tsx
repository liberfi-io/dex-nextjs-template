import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Button, Link, Skeleton } from "@heroui/react";
import { Token, TokenSocialMedias } from "@chainstream-io/sdk";
import { useTranslation } from "@liberfi/ui-base";
import { TokenAvatar } from "@liberfi/ui-dex/components/TokenAvatar";
import { Number } from "@liberfi/ui-dex/components/Number";
import {
  FavoriteFilledIcon,
  FavoriteOutlinedIcon,
  ShareIcon,
  TwitterIcon,
  TelegramIcon,
  WebsiteIcon,
} from "@liberfi/ui-dex/assets";
import {
  tokenInfoAtom,
  tokenLatestPriceAtom,
} from "@liberfi/ui-dex/states";
import { useTradeDataContext } from "@liberfi/ui-dex/components/trade/providers";
import { formatLongNumber, formatShortNumber } from "@liberfi/ui-dex/libs";

export function TokenDetailHeader() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <HeaderSkeleton />;
}

function Content({ token }: { token: Token }) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useTradeDataContext();
  const latestPrice = useAtomValue(tokenLatestPriceAtom);

  const socials = useMemo<TokenSocialMedias>(() => {
    try {
      return typeof token.socialMedias === "string"
        ? JSON.parse(token.socialMedias ?? "{}")
        : typeof token.socialMedias === "object"
          ? (token.socialMedias as TokenSocialMedias)
          : {};
    } catch {
      return {};
    }
  }, [token]);

  const displayPrice = latestPrice ? `$${formatLongNumber(latestPrice)}` : "-";

  return (
    <div className="flex min-h-[64px] max-h-[64px] flex-1 flex-row items-center justify-start gap-4 border-b border-border-subtle pl-4 pr-4">
      {/* Token identity — Axiom: shrink-0, gap=8px, h=42px, avatar 36x36 */}
      <div className="flex shrink-0 flex-row items-center justify-center gap-2 h-[42px]">
        <TokenAvatar
          className="flex-none"
          src={token.imageUrl ?? ""}
          name={token.symbol}
          size={36}
        />
        <div className="flex flex-col items-start justify-start gap-0 text-nowrap h-[42px]">
          <span className="text-sm font-medium text-foreground leading-[21px]">
            {token.symbol}
          </span>
          <div className="flex items-center gap-1">
            {socials.website && (
              <SocialButton href={socials.website}>
                <WebsiteIcon width={14} height={14} />
              </SocialButton>
            )}
            {socials.twitter && (
              <SocialButton href={socials.twitter}>
                <TwitterIcon width={14} height={14} />
              </SocialButton>
            )}
            {socials.telegram && (
              <SocialButton href={socials.telegram}>
                <TelegramIcon width={14} height={14} />
              </SocialButton>
            )}
          </div>
        </div>
      </div>

      {/* Market cap — Axiom: 12px/500, muted gray, next to token name */}
      <span className="shrink-0 text-xs font-medium tabular-nums leading-4 text-[rgb(119,122,140)]">
        {token.marketData?.marketCapInUsd ? (
          <Number value={token.marketData.marketCapInUsd} abbreviate defaultCurrencySign="$" />
        ) : (
          displayPrice
        )}
      </span>

      {/* Key metrics — Axiom: flex-col, gap=3px, px=4px, py=2px, label 12px, value 16px */}
      <Metric label="Price" value={displayPrice} />
      <Metric
        label={t("extend.token_list.attributes.liquidity")}
        value={
          token.marketData?.totalTvlInUsd ? (
            <Number value={token.marketData.totalTvlInUsd} abbreviate defaultCurrencySign="$" />
          ) : (
            "-"
          )
        }
      />
      {/* Supply — Axiom: flex-row, gap=8px */}
      <div className="flex shrink-0 flex-row items-center gap-2">
        <Metric
          label="Supply"
          value={
            token.marketData?.totalSupply
              ? formatShortNumber(window.Number(token.marketData.totalSupply))
              : "-"
          }
        />
      </div>
      <Metric label="Global Fees Paid" value={"-"} />

      {/* Right section — Axiom: flex-1 jc=flex-end gap=12px */}
      <div className="flex flex-1 flex-row items-center justify-end gap-3">
        <div className="flex shrink-0 flex-row items-center justify-start gap-2">
          <Button
            isIconOnly
            className="flex w-6 min-w-6 h-6 min-h-6 bg-transparent text-neutral hover:text-foreground rounded-full p-0"
            disableRipple
            onPress={toggleFavorite}
          >
            {isFavorite ? (
              <FavoriteFilledIcon width={16} height={16} />
            ) : (
              <FavoriteOutlinedIcon width={16} height={16} />
            )}
          </Button>
          <Button
            isIconOnly
            className="flex w-6 min-w-6 h-6 min-h-6 bg-transparent text-neutral hover:text-foreground rounded-full p-0"
            disableRipple
          >
            <ShareIcon width={16} height={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SocialButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      as={Link}
      href={href}
      target="_blank"
      isIconOnly
      className="flex w-4 min-w-4 h-4 min-h-4 text-neutral hover:text-foreground bg-transparent rounded-none p-0"
    >
      {children}
    </Button>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-row items-end justify-start gap-1 text-nowrap px-1 py-0.5 sm:flex-col sm:items-start sm:gap-[3px]">
      {label && (
        <span className="text-xs font-normal leading-4 text-[rgb(200,201,209)]">
          {label}
        </span>
      )}
      <div className="flex flex-row items-center gap-1">
        <span className="text-base tabular-nums leading-6 text-[rgb(252,252,252)]">
          {value}
        </span>
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex-none w-full min-h-[64px] max-h-[64px] flex items-center gap-4 px-4 border-b border-neutral-800">
      <Skeleton className="w-6 h-6 rounded-full" />
      <Skeleton className="w-14 h-4 rounded" />
      <Skeleton className="w-16 h-4 rounded" />
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="w-14 h-4 rounded" />
      ))}
    </div>
  );
}

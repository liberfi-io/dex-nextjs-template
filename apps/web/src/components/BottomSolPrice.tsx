import { Avatar } from "@heroui/react";
import { cn, StyledTooltip } from "@liberfi.io/ui";
import { Chain } from "@liberfi.io/types";
import { getPrimaryTokenAvatar } from "../application/tokens";
import { useSolQuotePrice } from "../application/useSolQuotePrice";
import { useTranslation } from "@liberfi.io/i18n";
import { formatPriceInUsd } from "@liberfi.io/utils";

const avatar = getPrimaryTokenAvatar(Chain.SOLANA);

export function BottomSolPrice() {
  const { t } = useTranslation();
  const quotePrice = useSolQuotePrice();

  return (
    <StyledTooltip content={t("extend.toolbar.sol_price_usd")} closeDelay={0}>
      <div className="flex items-center gap-1">
        <Avatar className="w-4.5 h-4.5 bg-transparent" src={avatar} />
        <span className={cn("text-xs font-medium", quotePrice ? "text-bullish" : "text-neutral")}>
          {quotePrice ? formatPriceInUsd(quotePrice) : "--"}
        </span>
      </div>
    </StyledTooltip>
  );
}

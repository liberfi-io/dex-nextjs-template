import { Avatar } from "@heroui/react";
import { clsx, StyledTooltip } from "@liberfi.io/ui";
import { formatPriceUSD } from "@liberfi.io/utils";
import { Chain, getPrimaryTokenAvatar } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";
import { CHAIN_QUOTE_TOKEN_SYMBOLS, useQuotePrice } from "@liberfi/ui-dex";

const avatar = getPrimaryTokenAvatar(Chain.SOLANA);

export function BottomSolPrice() {
  const { t } = useTranslation();

  const quotePrice = useQuotePrice(CHAIN_QUOTE_TOKEN_SYMBOLS[Chain.SOLANA] ?? "");

  return (
    <StyledTooltip content={t("extend.toolbar.sol_price_usd")} closeDelay={0}>
      <div className="flex items-center gap-1">
        <Avatar className="w-4.5 h-4.5 bg-transparent" src={avatar} />
        <span className={clsx("text-xs font-medium", quotePrice ? "text-bullish" : "text-neutral")}>
          {quotePrice ? formatPriceUSD(quotePrice) : "--"}
        </span>
      </div>
    </StyledTooltip>
  );
}

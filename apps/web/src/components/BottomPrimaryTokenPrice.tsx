import { useMemo } from "react";
import { Avatar } from "@heroui/react";
import { useTranslation } from "@liberfi.io/i18n";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { cn, StyledTooltip } from "@liberfi.io/ui";
import { formatPriceInUsd } from "@liberfi.io/utils";
import { getPrimaryTokenAvatar, getPrimaryTokenSymbol } from "../application/tokens";
import { usePrimaryTokenQuotePrice } from "../application/usePrimaryTokenQuotePrice";

export function BottomPrimaryTokenPrice() {
  const { t } = useTranslation();
  const { chain } = useCurrentChain();
  const quotePrice = usePrimaryTokenQuotePrice();
  const avatar = useMemo(() => getPrimaryTokenAvatar(chain), [chain]);
  const symbol = getPrimaryTokenSymbol(chain) ?? "";

  return (
    <StyledTooltip content={t("extend.toolbar.native_price_usd", { symbol })} closeDelay={0}>
      <div className="flex items-center gap-1">
        <Avatar className="w-4.5 h-4.5 bg-transparent" src={avatar} />
        <span
          className={cn("text-xs font-medium", quotePrice ? "text-positive" : "text-text-muted")}
        >
          {quotePrice ? formatPriceInUsd(quotePrice) : "--"}
        </span>
      </div>
    </StyledTooltip>
  );
}

import { formatPercentage } from "@/libs";
import { Number } from "@/components/Number";
import { useTranslation } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";

export function TradeTokenHolders({ token }: { token: Token }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-start gap-0.5 justify-center">
      <div className="text-xs text-neutral font-medium">
        <span className="text-foreground">
          {token.marketData.holders ? <Number value={token.marketData.holders} abbreviate /> : "-"}
        </span>{" "}
        /{" "}
        <span>
          {token.marketData.top10HoldingsRatio
            ? formatPercentage(token.marketData.top10HoldingsRatio)
            : "-"}
        </span>{" "}
        /{" "}
        <span>
          {token.marketData.top100HoldingsRatio
            ? formatPercentage(token.marketData.top100HoldingsRatio)
            : "-"}
        </span>
      </div>
      <div className="text-xxs text-neutral">
        {t("extend.token_list.attributes.holders")} /{" "}
        {t("extend.token_list.attributes.holders_distribution.top_10")} /{" "}
        {t("extend.token_list.attributes.holders_distribution.top_100")}
      </div>
    </div>
  );
}

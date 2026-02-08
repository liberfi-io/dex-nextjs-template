import { Token } from "@chainstream-io/sdk";
import { formatPercent, RecursivePartial } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";

 
export function PulseListItemBondingTooltip({ token }: { token: RecursivePartial<Token> }) {
  const { t } = useTranslation();

  return (
    <div className="text-xs text-primary">
      {t("extend.pulse.bonding")}: {formatPercent(token.marketData?.completionRatio ?? 0)}
    </div>
  );
}

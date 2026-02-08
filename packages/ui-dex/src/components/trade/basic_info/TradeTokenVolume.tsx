import { Token } from "@chainstream-io/sdk";
import { Number } from "@/components/Number";
import { useTranslation } from "@liberfi/ui-base";
import { tokenTraders, tokenTrades, tokenVolumesInUsd } from "@/libs";
import { useMemo } from "react";

export function TradeTokenVolume({ token }: { token: Token }) {
  const { t } = useTranslation();

  const volumesInUsd = useMemo(() => tokenVolumesInUsd(token, "24h"), [token]);

  const trades = useMemo(() => tokenTrades(token, "24h"), [token]);

  const traders = useMemo(() => tokenTraders(token, "24h"), [token]);

  return (
    <div className="flex flex-col items-start gap-0.5 justify-center">
      <div className="text-xs text-neutral font-medium">
        <span className="text-foreground">
          {volumesInUsd ? <Number value={volumesInUsd} abbreviate defaultCurrencySign="$" /> : "-"}
        </span>{" "}
        / <span>{trades ? <Number value={trades} abbreviate /> : "-"}</span> /{" "}
        <span>{traders ? <Number value={traders} abbreviate /> : "-"}</span>
      </div>
      <div className="text-xxs text-neutral">
        {t("extend.common.time.24h")} {t("extend.token_list.attributes.volume")} /{" "}
        {t("extend.token_list.attributes.txs")} / {t("extend.token_list.attributes.traders")}
      </div>
    </div>
  );
}

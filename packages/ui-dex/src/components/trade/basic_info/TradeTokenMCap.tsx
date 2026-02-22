import { Token } from "@chainstream-io/sdk";
import { Number } from "../../Number";
import { formatAge } from "../../../libs";
import { tickAtom, useTranslation } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

export function TradeTokenMCap({ token }: { token: Token }) {
  const { t } = useTranslation();

  const now = useAtomValue(tickAtom);

  const age = useMemo(
    () => (token.tokenCreatedAt ? formatAge(token.tokenCreatedAt, now) : "--"),
    [token.tokenCreatedAt, now],
  );

  return (
    <div className="flex flex-col items-start gap-0.5 justify-center">
      <div className="text-xs text-neutral font-medium">
        <span className="text-foreground">
          {token.marketData.marketCapInUsd ? (
            <Number value={token.marketData.marketCapInUsd} abbreviate defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </span>{" "}
        /{" "}
        <span>
          {token.marketData.totalTvlInUsd ? (
            <Number value={token.marketData.totalTvlInUsd} abbreviate defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </span>{" "}
        / <span>{age}</span>
      </div>
      <div className="text-xxs text-neutral">
        {t("extend.token_list.attributes.market_cap")} / {t("extend.token_list.attributes.liquidity")} /{" "}
        {t("extend.token_list.attributes.age")}
      </div>
    </div>
  );
}

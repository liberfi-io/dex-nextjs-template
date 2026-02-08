import { Number } from "@/components/Number";
import { tickAtom, useTranslation } from "@liberfi/ui-base";
import { formatAge, formatPercentage, tokenTraders, tokenTrades, tokenVolumesInUsd } from "@/libs";
import { Token } from "@chainstream-io/sdk";
import { useMemo } from "react";
import { useAtomValue } from "jotai";

export function TradeHeaderTokenMarketData({ token }: { token: Token }) {
  const { t } = useTranslation();

  const volumesInUsd = useMemo(() => tokenVolumesInUsd(token, "24h"), [token]);

  const trades = useMemo(() => tokenTrades(token, "24h"), [token]);

  const traders = useMemo(() => tokenTraders(token, "24h"), [token]);

  const now = useAtomValue(tickAtom);

  const age = useMemo(
    () => (token.tokenCreatedAt ? formatAge(token.tokenCreatedAt, now) : "--"),
    [token.tokenCreatedAt, now],
  );

  return (
    <div className="flex-none h-full flex flex-col justify-center items-start gap-2.5 text-xxs text-neutral font-medium">
      {/* 24h volume / txs / traders */}
      <div className="flex flex-col gap-1">
        <div>{`24h ${t("extend.token_list.attributes.volume")} / ${t("extend.token_list.attributes.txs")} / ${t(
          "extend.token_list.attributes.traders",
        )}`}</div>
        <div>
          <span className="text-foreground">
            {volumesInUsd ? (
              <Number value={volumesInUsd} abbreviate defaultCurrencySign="$" />
            ) : (
              "-"
            )}
          </span>{" "}
          / <span>{trades ? <Number value={trades} abbreviate /> : "-"}</span> /{" "}
          <span>{traders ? <Number value={traders} abbreviate /> : "-"}</span>
        </div>
      </div>

      {/* holders */}
      <div className="flex flex-col gap-1">
        <div>{`${t("extend.token_list.attributes.holders")} / ${t(
          "extend.token_list.attributes.holders_distribution.top_10",
        )} / ${t("extend.token_list.attributes.holders_distribution.top_100")}`}</div>
        <div>
          <span className="text-foreground">
            {token.marketData.holders ? (
              <Number value={token.marketData.holders} abbreviate />
            ) : (
              "-"
            )}
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
      </div>

      {/* liquidity / age */}
      <div className="flex flex-col gap-1">
        <div>{`${t("extend.token_list.attributes.liquidity")} / ${t("extend.token_list.attributes.age")}`}</div>
        <div>
          <span className="text-foreground">
            {token.marketData.totalTvlInUsd ? (
              <Number value={token.marketData.totalTvlInUsd} abbreviate defaultCurrencySign="$" />
            ) : (
              "-"
            )}
          </span>{" "}
          / <span>{age}</span>
        </div>
      </div>
    </div>
  );
}

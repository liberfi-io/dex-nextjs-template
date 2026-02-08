import { useMemo } from "react";
import { useTokenListContext } from "../TokenListContext";
import { Token } from "@chainstream-io/sdk";
import { tokenBuys, tokenSells, tokenTrades } from "@/libs";
import { formatAmount } from "@liberfi/core";

export function TokenTradesCell({ token }: { token: Token }) {
  const { timeframe } = useTokenListContext();

  const txs = useMemo(() => tokenTrades(token, timeframe), [token, timeframe]);

  const buys = useMemo(() => tokenBuys(token, timeframe), [token, timeframe]);

  const sells = useMemo(() => tokenSells(token, timeframe), [token, timeframe]);

  return (
    <div className="flex flex-col gap-1 justify-center items-start">
      <span>{txs ? formatAmount(txs) : "--"}</span>
      <div className="flex gap-1">
        <span className="text-bullish">{buys ? formatAmount(buys) : "--"}</span>/
        <span className="text-bearish">{sells ? formatAmount(sells) : "--"}</span>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useTokenListContext } from "../TokenListContext";
import { Token } from "@chainstream-io/sdk";
import { tokenBuyers, tokenSellers, tokenTraders } from "@/libs";
import { formatAmount } from "@liberfi/core";

export function TokenTradersCell({ token }: { token: Token }) {
  const { timeframe } = useTokenListContext();

  const traders = useMemo(() => tokenTraders(token, timeframe), [token, timeframe]);

  const buyers = useMemo(() => tokenBuyers(token, timeframe), [token, timeframe]);

  const sellers = useMemo(() => tokenSellers(token, timeframe), [token, timeframe]);

  return (
    <div className="flex flex-col gap-1 justify-center items-start">
      <span>{traders ? formatAmount(traders) : "--"}</span>
      <div className="flex gap-1">
        <span className="text-bullish">{buyers ? formatAmount(buyers) : "--"}</span>/
        <span className="text-bearish">{sellers ? formatAmount(sellers) : "--"}</span>
      </div>
    </div>
  );
}

import { Token } from "@chainstream-io/sdk";
import { formatAmountUSD } from "@liberfi/core";
import { useMemo } from "react";

export function TokenLiquidityCell({ token }: { token: Token }) {
  const liquidity = useMemo(
    () => token.marketData?.totalTvlInUsd,
    [token.marketData?.totalTvlInUsd],
  );
  return <>{liquidity ? formatAmountUSD(liquidity) : "--"}</>;
}

import { Token } from "@chainstream-io/sdk";
import { formatAmountInUsd } from "@liberfi.io/utils";
import { useMemo } from "react";

export function TokenLiquidityCell({ token }: { token: Token }) {
  const liquidity = useMemo(
    () => token.marketData?.totalTvlInUsd,
    [token.marketData?.totalTvlInUsd],
  );
  return <>{liquidity ? formatAmountInUsd(liquidity) : "--"}</>;
}

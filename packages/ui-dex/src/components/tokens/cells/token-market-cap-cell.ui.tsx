import { Token } from "@chainstream-io/sdk";
import { formatAmountUSD } from "@liberfi/core";
import { useMemo } from "react";

export function TokenMarketCapCell({ token }: { token: Token }) {
  const marketCap = useMemo(
    () => token.marketData?.marketCapInUsd,
    [token.marketData?.marketCapInUsd],
  );
  return <>{marketCap ? formatAmountUSD(marketCap) : "--"}</>;
}

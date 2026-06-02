import { Token } from "@chainstream-io/sdk";
import { formatMCapInUsd } from "@liberfi.io/utils";
import { useMemo } from "react";

export function TokenMarketCapCell({ token }: { token: Token }) {
  const marketCap = useMemo(
    () => token.marketData?.marketCapInUsd,
    [token.marketData?.marketCapInUsd],
  );
  return <>{marketCap ? formatMCapInUsd(marketCap) : "--"}</>;
}

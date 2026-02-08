import { Token } from "@chainstream-io/sdk";
import { useMemo } from "react";
import { useTokenListContext } from "../TokenListContext";
import { tokenBuyVolumesInUsd, tokenSellVolumesInUsd, tokenVolumesInUsd } from "@/libs";
import { formatAmountUSD } from "@liberfi/core";

export function TokenVolumesCell({ token }: { token: Token }) {
  const { timeframe } = useTokenListContext();

  const volumesInUsd = useMemo(() => tokenVolumesInUsd(token, timeframe), [token, timeframe]);

  const buyVolumes = useMemo(() => tokenBuyVolumesInUsd(token, timeframe), [token, timeframe]);

  const sellVolumes = useMemo(() => tokenSellVolumesInUsd(token, timeframe), [token, timeframe]);

  return (
    <div className="flex flex-col gap-1 justify-center items-start">
      <span>{volumesInUsd ? formatAmountUSD(volumesInUsd) : "--"}</span>
      <div className="flex gap-1">
        <span className="text-bullish">{buyVolumes ? formatAmountUSD(buyVolumes) : "--"}</span>/
        <span className="text-bearish">{sellVolumes ? formatAmountUSD(sellVolumes) : "--"}</span>
      </div>
    </div>
  );
}

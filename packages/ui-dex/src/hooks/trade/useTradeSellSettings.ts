import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Chain } from "@liberfi/core";
import { tradeSettingsAtom } from "../../states/trade";

export function useTradeSellSettings(chainId: Chain) {
  const tradeSettings = useAtomValue(tradeSettingsAtom);
  const settings = useMemo(() => tradeSettings[chainId]?.sell, [tradeSettings, chainId]);
  return settings;
}

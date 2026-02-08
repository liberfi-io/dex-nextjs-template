import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { CHAIN_ID } from "@liberfi/core";
import { tradeSettingsAtom } from "@/states/trade";

export function useTradeBuySettings(chainId: CHAIN_ID) {
  const tradeSettings = useAtomValue(tradeSettingsAtom);
  const settings = useMemo(() => tradeSettings[chainId]?.buy, [tradeSettings, chainId]);
  return settings;
}

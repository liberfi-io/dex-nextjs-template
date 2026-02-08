import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { CHAIN_ID } from "@liberfi/core";
import { tradeSettingsAtom } from "@/states";
import { BuySettingsValues } from "@/types";

export function useSaveTradeBuySettings(chainId: CHAIN_ID) {
  const save = useSetAtom(tradeSettingsAtom);
  return useCallback(
    (settings: BuySettingsValues) => {
      save((prev) => ({ ...prev, [chainId]: { ...prev[chainId], buy: settings } }));
    },
    [chainId, save],
  );
}

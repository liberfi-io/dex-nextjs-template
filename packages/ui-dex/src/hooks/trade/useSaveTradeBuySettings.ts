import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { Chain } from "@liberfi/core";
import { tradeSettingsAtom } from "../../states";
import { BuySettingsValues } from "../../types";

export function useSaveTradeBuySettings(chainId: Chain) {
  const save = useSetAtom(tradeSettingsAtom);
  return useCallback(
    (settings: BuySettingsValues) => {
      save((prev) => ({ ...prev, [chainId]: { ...prev[chainId], buy: settings } }));
    },
    [chainId, save],
  );
}

import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { Chain } from "@liberfi/core";
import { tradeSettingsAtom } from "../../states";
import { SellSettingsValues } from "../../types";

export function useSaveTradeSellSettings(chainId: Chain) {
  const save = useSetAtom(tradeSettingsAtom);
  return useCallback(
    (settings: SellSettingsValues) => {
      save((prev) => ({ ...prev, [chainId]: { ...prev[chainId], sell: settings } }));
    },
    [chainId, save],
  );
}

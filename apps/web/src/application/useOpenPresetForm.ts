"use client";

import { useCallback } from "react";
import { Chain } from "@liberfi.io/types";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import type { PresetFormModalParams } from "@liberfi.io/ui-trade";

export function useOpenPresetForm() {
  const { chain } = useCurrentChain();
  const { onOpen: openPresetModal } = useAsyncModal<PresetFormModalParams>("preset");

  return useCallback(
    (preset: number) => {
      openPresetModal({
        params: {
          chains: [Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE],
          defaultChain: chain,
          defaultDirection: "buy",
          defaultPresetIndex: preset,
        },
      });
    },
    [chain, openPresetModal],
  );
}

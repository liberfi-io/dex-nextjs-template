"use client";

import { useCallback } from "react";
import { Chain } from "@liberfi.io/types";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import type { PresetFormModalParams } from "@liberfi.io/ui-trade";
import { useDeferredAsyncModal } from "../components/modals/DeferredAsyncModalHost";
import { loadPresetFormModal } from "../components/modals/modal-loaders";
import { PRESET_FORM_MODAL_ID } from "../components/modals/modal-contracts";

export function useOpenPresetForm() {
  const { chain } = useCurrentChain();
  const { onOpen: openPresetModal } =
    useDeferredAsyncModal<PresetFormModalParams>(
      PRESET_FORM_MODAL_ID,
      loadPresetFormModal,
    );

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

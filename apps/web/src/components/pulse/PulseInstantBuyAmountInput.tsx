import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { cloneDeep } from "lodash-es";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { Chain } from "@liberfi.io/types";
import { PulseListType } from "@liberfi.io/ui-tokens";
import {
  AmountPresetInputUI,
  type AmountPresetInputUIProps,
  type PresetFormModalParams,
  usePresetValues,
} from "@liberfi.io/ui-trade";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import { getNativeToken } from "@liberfi.io/utils";
import { pulseSettingsAtom } from "../../states/pulse";

export type PulseInstantBuyAmountInputProps = {
  type: PulseListType;
} & Pick<
  AmountPresetInputUIProps,
  "radius" | "size" | "className"
>;

export function PulseInstantBuyAmountInput({
  type,
  ...inputProps
}: PulseInstantBuyAmountInputProps) {
  const { chain } = useCurrentChain();
  const [pulseSettings, setPulseSettings] = useAtom(pulseSettingsAtom);

  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);
  const settings = useMemo(() => pulseSettings[type], [pulseSettings, type]);
  const preset0 = usePresetValues({ chain, direction: "buy", presetIndex: 0 });
  const preset1 = usePresetValues({ chain, direction: "buy", presetIndex: 1 });
  const preset2 = usePresetValues({ chain, direction: "buy", presetIndex: 2 });
  const presetValues = useMemo(() => [preset0, preset1, preset2], [preset0, preset1, preset2]);
  const { onOpen: openPresetModal } = useAsyncModal<PresetFormModalParams>("preset");

  const handlePresetClick = useCallback(
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

  const handleAmountChange = useCallback(
    (amount?: number) =>
      setPulseSettings((prev) => {
        const next = cloneDeep(prev);
        const s = next[type] ?? {};
        const ibs = s.instant_buy ?? {};
        ibs.amount = amount;
        s.instant_buy = ibs;
        next[type] = s;
        return next;
      }),
    [type, setPulseSettings],
  );

  const handlePresetChange = useCallback(
    (preset: number) =>
      setPulseSettings((prev) => {
        const next = cloneDeep(prev);
        const s = next[type] ?? {};
        const ibs = s.instant_buy ?? {};
        ibs.preset = preset;
        s.instant_buy = ibs;
        next[type] = s;
        return next;
      }),
    [type, setPulseSettings],
  );

  if (!nativeToken) return null;

  return (
    <AmountPresetInputUI
      token={nativeToken}
      chain={chain}
      amount={settings?.instant_buy?.amount}
      preset={settings?.instant_buy?.preset}
      onAmountChange={handleAmountChange}
      onPresetChange={handlePresetChange}
      onPresetClick={handlePresetClick}
      presetValues={presetValues}
      {...inputProps}
    />
  );
}

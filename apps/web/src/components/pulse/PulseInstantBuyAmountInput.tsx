import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { cloneDeep } from "lodash-es";
import { PulseListType } from "@liberfi.io/ui-tokens";
import {
  InstantBuyAmountInput,
  type InstantBuyAmountInputProps,
} from "@liberfi/ui-dex";
import { pulseSettingsAtom } from "../../states/pulse";

export type PulseInstantBuyAmountInputProps = {
  type: PulseListType;
} & Pick<
  InstantBuyAmountInputProps,
  "variant" | "radius" | "size" | "fullWidth" | "className"
>;

export function PulseInstantBuyAmountInput({
  type,
  ...inputProps
}: PulseInstantBuyAmountInputProps) {
  const [pulseSettings, setPulseSettings] = useAtom(pulseSettingsAtom);

  const settings = useMemo(() => pulseSettings[type], [pulseSettings, type]);

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

  return (
    <InstantBuyAmountInput
      amount={settings?.instant_buy?.amount}
      preset={settings?.instant_buy?.preset}
      onAmountChange={handleAmountChange}
      onPresetChange={handlePresetChange}
      {...inputProps}
    />
  );
}

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { TradePresetValues } from "@/types";
import { SlippageInput } from "./SlippageInput";
import { PriorityFeeInput } from "./PriorityFeeInput";
import { TipFeeInput } from "./TipFeeInput";
import { AutoFeeInput } from "./AutoFeeInput";
import { MaxAutoFeeInput } from "./MaxAutoFeeInput";
import { AntiMEVInput } from "./AntiMEVInput";
import { CustomRPCInput } from "./CustomRPCInput";
import { useCallbackRef } from "@liberfi/ui-base";

export type PresetFormProps = {
  className?: string;
  value: TradePresetValues;
  onChange: (value: TradePresetValues) => void;
};

export function PresetForm({ value, onChange, className }: PresetFormProps) {
  const handleChange = useCallbackRef(onChange);
  const [slippage, setSlippage] = useState(value.slippage);
  const [priorityFee, setPriorityFee] = useState(value.priorityFee);
  const [tipFee, setTipFee] = useState(value.tipFee);
  const [autoFee, setAutoFee] = useState(value.autoFee);
  const [maxAutoFee, setMaxAutoFee] = useState(value.maxAutoFee);
  const [antiMev, setAntiMev] = useState(value.antiMev);
  const [customRPC, setCustomRPC] = useState(value.customRPC);

  useEffect(() => {
    handleChange({ slippage, priorityFee, tipFee, autoFee, maxAutoFee, antiMev, customRPC });
  }, [handleChange, slippage, priorityFee, tipFee, autoFee, maxAutoFee, antiMev, customRPC]);

  return (
    <div className={clsx("space-y-1.5", className)}>
      <SlippageInput value={slippage} onChange={setSlippage} />
      <PriorityFeeInput value={priorityFee} onChange={setPriorityFee} />
      <TipFeeInput value={tipFee} onChange={setTipFee} />
      <AutoFeeInput value={autoFee} onChange={setAutoFee} />
      {autoFee && <MaxAutoFeeInput value={maxAutoFee} onChange={setMaxAutoFee} />}
      <AntiMEVInput value={antiMev} onChange={setAntiMev} />
      <CustomRPCInput value={customRPC} onChange={setCustomRPC} />
    </div>
  );
}

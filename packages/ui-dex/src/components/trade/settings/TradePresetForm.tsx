import { SlippageInput } from "./SlippageInput";
import { PriorityFeeInput } from "./PriorityFeeInput";
import { TipFeeInput } from "./TipFeeInput";
import { AutoFeeInput } from "./AutoFeeInput";
import { CustomRPCInput } from "./CustomRPCInput";
import { AntiMEVInput } from "./AntiMEVInput";

export function TradePresetForm({ preset }: { preset: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-8 max-sm:gap-4">
        <SlippageInput preset={preset} />
        <PriorityFeeInput preset={preset} />
        <TipFeeInput preset={preset} />
      </div>
      <AutoFeeInput preset={preset} />
      <AntiMEVInput preset={preset} />
      <CustomRPCInput preset={preset} />
    </div>
  );
}

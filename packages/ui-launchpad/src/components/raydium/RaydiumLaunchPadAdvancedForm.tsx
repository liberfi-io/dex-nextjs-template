import { useFormContext, useWatch } from "react-hook-form";
import clsx from "clsx";
import { Divider } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { RaydiumLaunchPadQuoteMintSelect } from "./RaydiumLaunchPadQuoteMintSelect";
import { RaydiumLaunchPadSupplyInput } from "./RaydiumLaunchPadSupplyInput";
import { RaydiumLaunchPadRaisedInput } from "./RaydiumLaunchPadRaisedInput";
import { RaydiumLaunchPadSoldInput } from "./RaydiumLaunchPadSoldInput";
import { RaydiumLaunchPadRemainingInput } from "./RaydiumLaunchPadRemainingInput";
import { RaydiumLaunchPadLockedInput } from "./RaydiumLaunchPadLockedInput";
import { RaydiumLaunchPadShareFeeSwitch } from "./RaydiumLaunchPadShareFeeSwitch";
import { RaydiumLaunchPadVestingDurationInput } from "./RaydiumLaunchPadVestingDurationInput";
import { RaydiumLaunchPadVestingCliffInput } from "./RaydiumLaunchPadVestingCliffInput";

export type RaydiumLaunchPadAdvancedFormProps = {
  className?: string;
};

export function RaydiumLaunchPadAdvancedForm({ className }: RaydiumLaunchPadAdvancedFormProps) {
  const { t } = useTranslation();

  const { control } = useFormContext();

  const locked = useWatch({ control, name: "locked" });

  return (
    <div className={clsx("w-full flex flex-col gap-4 text-sm", className)}>
      <RaydiumLaunchPadQuoteMintSelect />
      <RaydiumLaunchPadSupplyInput />
      <RaydiumLaunchPadRaisedInput />
      <RaydiumLaunchPadSoldInput />
      <RaydiumLaunchPadRemainingInput />
      <RaydiumLaunchPadLockedInput />
      <RaydiumLaunchPadShareFeeSwitch />

      {locked > 0 && (
        <>
          {/* separator title */}
          <div className="w-full flex items-center gap-4">
            <div className="flex-1">
              <Divider orientation="horizontal" className="bg-border" />
            </div>
            <div className="text-sm text-neutral">{t("extend.launchpad.vesting_title")}</div>
            <div className="flex-1">
              <Divider orientation="horizontal" className="bg-border" />
            </div>
          </div>

          <RaydiumLaunchPadVestingDurationInput />
          <RaydiumLaunchPadVestingCliffInput />
        </>
      )}
    </div>
  );
}

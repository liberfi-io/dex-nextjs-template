import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";

export function RaydiumLaunchPadShareFeeSwitch() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="shareFee"
      render={({ field: { name, onChange, value, onBlur, ref, disabled } }) => (
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between">
            <h3>{t("extend.launchpad.share_fee_label")}</h3>
            <Switch
              ref={ref}
              name={name}
              isSelected={value}
              onValueChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              color="primary"
              size="sm"
              aria-label={t("extend.launchpad.share_fee_label")}
            />
          </div>
          <p className="p-1 text-neutral text-xs">{t("extend.launchpad.share_fee_explained")}</p>
        </div>
      )}
    />
  );
}

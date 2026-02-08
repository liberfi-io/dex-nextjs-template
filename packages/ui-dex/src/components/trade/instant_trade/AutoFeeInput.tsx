import { Button, Switch, Tooltip } from "@heroui/react";
import { InfoIcon, useTranslation } from "@liberfi/ui-base";

export type AutoFeeInputProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function AutoFeeInput({ value, onChange }: AutoFeeInputProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full grid grid-cols-2 gap-2 items-center">
      <div className="text-xs text-neutral flex items-center gap-1">
        {t("extend.trade.settings.auto_fee")}
        <Tooltip
          content={t("extend.trade.settings.auto_fee_explained")}
          classNames={{ content: "text-xs text-neutral py-2 px-4 max-w-xs" }}
        >
          <Button
            isIconOnly
            className="bg-transparent min-w-0 w-4 min-h-0 h-4 p-0"
            size="sm"
            disableRipple
          >
            <InfoIcon width={13} height={13} className="text-neutral" />
          </Button>
        </Tooltip>
      </div>
      <div className="flex justify-end">
        <Switch
          isSelected={value}
          onValueChange={onChange}
          color="primary"
          size="sm"
          aria-label={t("extend.trade.settings.auto_fee")}
        />
      </div>
    </div>
  );
}

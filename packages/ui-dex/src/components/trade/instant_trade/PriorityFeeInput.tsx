import { ChangeEvent, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { Button, NumberInput, Tooltip } from "@heroui/react";
import { getPrimaryTokenDecimals, getPrimaryTokenSymbol } from "@liberfi/core";
import { chainAtom, InfoIcon, useTranslation } from "@liberfi/ui-base";

export type PriorityFeeInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function PriorityFeeInput({ value, onChange }: PriorityFeeInputProps) {
  const { t } = useTranslation();

  const chain = useAtomValue(chainAtom);

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chain), [chain]);

  const handleValueChange = useCallback(
    (value: number | ChangeEvent<HTMLInputElement>) => {
      // ignore change events if the value is not a number
      if (typeof value === "number") {
        if (isNaN(value)) {
          onChange(null);
        } else {
          onChange(value);
        }
      }
    },
    [onChange],
  );

  return (
    <div className="w-full grid grid-cols-2 gap-2 items-center">
      <div className="text-xs text-neutral flex items-center gap-1">
        {t("extend.trade.settings.priority_fee")}
        <Tooltip
          content={t("extend.trade.settings.priority_fee_explained")}
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
      <div>
        <NumberInput
          fullWidth
          value={value === null ? undefined : value}
          onChange={handleValueChange}
          hideStepper
          minValue={0}
          formatOptions={{
            maximumFractionDigits: primaryTokenDecimals,
          }}
          endContent={<span className="text-xs text-neutral">{primaryTokenSymbol}</span>}
          classNames={{
            inputWrapper:
              "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
            input: "text-xs",
          }}
          aria-label={t("extend.trade.settings.priority_fee")}
        />
      </div>
    </div>
  );
}

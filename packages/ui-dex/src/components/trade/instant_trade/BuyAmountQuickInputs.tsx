import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { Button, NumberInput } from "@heroui/react";
import { chainAtom, CheckIcon, EditIcon } from "@liberfi/ui-base";
import { useSaveTradeBuySettings, useTradeBuySettings } from "../../../hooks";
import { defaultBuySettingsValues, defaultCustomBuyAmounts } from "../../../types";

export type BuyAmountQuickInputsProps = {
  onChange?: (amount: number) => void;
};

export function BuyAmountQuickInputs({ onChange }: BuyAmountQuickInputsProps) {
  const chain = useAtomValue(chainAtom);

  const settings = useTradeBuySettings(chain);

  const save = useSaveTradeBuySettings(chain);

  const customAmounts = useMemo(
    () => settings?.customAmounts ?? defaultCustomBuyAmounts,
    [settings],
  );

  const [isEditing, setIsEditing] = useState(false);

  const [tempAmounts, setTempAmounts] = useState<(number | null)[]>([]);

  const handleEdit = useCallback(() => {
    setTempAmounts(customAmounts);
    setIsEditing(true);
  }, [customAmounts]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    save({
      ...(settings ?? defaultBuySettingsValues),
      customAmounts: tempAmounts,
    });
  }, [settings, save, tempAmounts]);

  return (
    <div className="flex gap-0.5">
      <div className="flex-auto grid grid-cols-4 gap-0.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={clsx("h-6 bg-content2 flex items-center justify-center", {
              "rounded-bl-lg": index === 0,
            })}
          >
            {isEditing ? (
              // edit quick input amount
              <NumberInput
                fullWidth
                value={tempAmounts[index] === null ? undefined : tempAmounts[index]}
                onChange={(value: number | ChangeEvent<HTMLInputElement>) => {
                  // ignore change events if the value is not a number
                  if (typeof value === "number") {
                    const v = isNaN(value) ? null : value;
                    setTempAmounts((prev) => {
                      const newAmounts = [...prev];
                      newAmounts[index] = v;
                      return newAmounts;
                    });
                  }
                }}
                min={0}
                hideStepper
                classNames={{
                  inputWrapper: clsx(
                    "p-0 h-6 min-h-0 rounded-none flex shadow-none",
                    "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3",
                    {
                      "rounded-bl-lg": index === 0,
                    },
                  ),
                  innerWrapper: "pb-0",
                  input: "text-xs text-center",
                }}
              />
            ) : (
              // quick inputs
              <Button
                className="min-w-0 w-full min-h-0 h-full p-0 bg-transparent text-xs"
                size="sm"
                disableRipple
                onPress={() => customAmounts[index] && onChange?.(customAmounts[index])}
              >
                {customAmounts[index] ?? ""}
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex-none bg-content2 rounded-br-lg overflow-hidden">
        {isEditing ? (
          // save edits
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent h-6 min-h-6 p-0"
            disableRipple
            onPress={handleSave}
          >
            <CheckIcon width={12} height={12} />
          </Button>
        ) : (
          // start editing
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent h-6 min-h-6 p-0"
            disableRipple
            onPress={handleEdit}
          >
            <EditIcon width={12} height={12} />
          </Button>
        )}
      </div>
    </div>
  );
}

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { Button, NumberInput } from "@heroui/react";
import { chainAtom, CheckIcon, EditIcon } from "@liberfi/ui-base";
import { useSaveTradeSellSettings, useTradeSellSettings } from "@/hooks";
import { defaultCustomSellPercentages, defaultSellSettingsValues } from "@/types";

export type SellPercentageQuickInputsProps = {
  onChange?: (percent: number) => void;
};

export function SellPercentageQuickInputs({ onChange }: SellPercentageQuickInputsProps) {
  const chain = useAtomValue(chainAtom);

  const settings = useTradeSellSettings(chain);

  const save = useSaveTradeSellSettings(chain);

  const customPercentages = useMemo(
    () => settings?.customPercentages ?? defaultCustomSellPercentages,
    [settings],
  );

  const [isEditing, setIsEditing] = useState(false);

  const [tempPercentages, setTempPercentages] = useState<(number | null)[]>([]);

  const handleEdit = useCallback(() => {
    setTempPercentages(customPercentages);
    setIsEditing(true);
  }, [customPercentages]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    save({
      ...(settings ?? defaultSellSettingsValues),
      customPercentages: tempPercentages,
    });
  }, [settings, save, tempPercentages]);

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
                value={tempPercentages[index] === null ? undefined : tempPercentages[index]}
                onChange={(value: number | ChangeEvent<HTMLInputElement>) => {
                  // ignore change events if the value is not a number
                  if (typeof value === "number") {
                    const v = isNaN(value) ? null : value;
                    setTempPercentages((prev) => {
                      const newPercentages = [...prev];
                      newPercentages[index] = v;
                      return newPercentages;
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
                onPress={() => customPercentages[index] && onChange?.(customPercentages[index])}
                endContent={<span className="text-xs text-neutral">%</span>}
              >
                {customPercentages[index] ?? ""}
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

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { NumberInput } from "@heroui/react";

export function CustomSellPercentagesInput() {
  const { control } = useFormContext();

  const { fields } = useFieldArray({ control, name: "customPercentages" });

  return (
    <div className="grid grid-cols-4 gap-2">
      {fields.map((field, index) => (
        <div key={field.id}>
          <Controller
            control={control}
            name={`customPercentages.${index}`}
            render={({
              field: { name, onChange, value, onBlur, ref, disabled },
              fieldState: { invalid },
            }) => (
              <NumberInput
                ref={ref}
                name={name}
                value={value}
                onChange={(value) => {
                  // ignore change events if the value is not a number
                  if (typeof value === "number") {
                    if (isNaN(value)) {
                      onChange(null);
                    } else {
                      onChange(value);
                    }
                  }
                }}
                onBlur={onBlur}
                disabled={disabled}
                isInvalid={invalid}
                fullWidth
                hideStepper
                endContent={<span className="text-xs text-neutral">%</span>}
                classNames={{
                  inputWrapper:
                    "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
                  input: "text-xs text-center",
                }}
                aria-label={field.id}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}

import { Controller, useFormContext } from "react-hook-form";
import { clsx } from "clsx";
import { Input } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";

export function CustomRPCInput({ preset }: { preset: number }) {
  const { t } = useTranslation();

  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={`presets.${preset}.customRPC`}
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="space-y-1.5">
          <h3 className={clsx("text-xs text-neutral", { "text-danger": invalid })}>
            {t("extend.trade.settings.custom_rpc")}
          </h3>
          <Input
            ref={ref}
            fullWidth
            name={name}
            value={value === null ? "" : value}
            onValueChange={(value) => {
              onChange(value || null);
            }}
            onBlur={onBlur}
            disabled={disabled}
            isInvalid={invalid}
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
              input: "text-xs",
            }}
            placeholder={t("extend.trade.settings.custom_rpc_placeholder")}
            aria-label={t("extend.trade.settings.custom_rpc")}
          />
          {error && error.message && <p className="text-danger text-xs">{t(error.message)}</p>}
        </div>
      )}
    />
  );
}

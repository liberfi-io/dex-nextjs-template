import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { Input } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";

export function LaunchPadTwitterInput() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="twitter"
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.twitter_label")}</h3>
          <Input
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            isInvalid={invalid}
            errorMessage={error?.message ? t(error.message) : undefined}
            placeholder={t("extend.launchpad.twitter_placeholder")}
            fullWidth
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3",
            }}
            aria-label={t("extend.launchpad.twitter_label")}
          />
        </div>
      )}
    />
  );
}

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { CreateRedPacketIcon } from "../icons";

export function RedPacketMaxClaimsInput() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="maxClaims"
      rules={{
        required: t("extend.redpacket.create.max_claims_error_required"),
        min: {
          value: 1,
          message: t("extend.redpacket.create.max_claims_error_min"),
        },
        max: {
          value: 10000,
          message: t("extend.redpacket.create.max_claims_error_max"),
        },
      }}
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <Input
          ref={ref}
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          isInvalid={invalid}
          errorMessage={error?.message}
          placeholder={t("extend.redpacket.create.max_claims_placeholder")}
          fullWidth
          classNames={{
            mainWrapper: "gap-1",
            inputWrapper:
              "rounded-lg bg-content1 data-[hover=true]:bg-content2 group-data-[focus=true]:bg-content2",
            input: "text-sm caret-primary placeholder:text-placeholder placeholder:text-sm",
          }}
          endContent={<CreateRedPacketIcon />}
        />
      )}
    />
  );
}

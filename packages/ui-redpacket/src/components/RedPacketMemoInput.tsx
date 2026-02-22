import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { RedPacketMemoIcon } from "../icons";

export function RedPacketMemoInput() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="memo"
      rules={{
        maxLength: {
          value: 24,
          message: t("extend.redpacket.create.memo_error_length"),
        },
      }}
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <Input
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          isInvalid={invalid}
          errorMessage={error?.message}
          placeholder={t("extend.redpacket.create.memo_placeholder")}
          fullWidth
          classNames={{
            mainWrapper: "gap-1",
            inputWrapper:
              "rounded-lg bg-content1 data-[hover=true]:bg-content2 group-data-[focus=true]:bg-content2",
            input: "text-sm caret-primary placeholder:text-placeholder placeholder:text-sm",
          }}
          endContent={<RedPacketMemoIcon />}
        />
      )}
    />
  );
}

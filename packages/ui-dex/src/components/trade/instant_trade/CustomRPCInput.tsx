import { Input } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";

export type CustomRPCInputProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export function CustomRPCInput({ value, onChange }: CustomRPCInputProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full flex gap-4 items-center">
      <div className="flex-none text-xs text-neutral">{t("extend.trade.settings.custom_rpc")}</div>
      <div className="flex-auto">
        <Input
          fullWidth
          value={value === null ? "" : value}
          onValueChange={(value) => {
            onChange(value || null);
          }}
          classNames={{
            inputWrapper:
              "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
            input: "text-xs",
          }}
          placeholder={t("extend.trade.settings.custom_rpc_placeholder")}
          aria-label={t("extend.trade.settings.custom_rpc")}
        />
      </div>
    </div>
  );
}

import { Key } from "react";
import { Button, Tab, Tabs, Tooltip } from "@heroui/react";
import { InfoIcon, useTranslation } from "@liberfi/ui-base";

export type AntiMEVInputProps = {
  value: boolean | "off" | "reduced" | "secure";
  onChange: (value: boolean | "off" | "reduced" | "secure") => void;
};

export function AntiMEVInput({ value, onChange }: AntiMEVInputProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full grid grid-cols-2 gap-2 items-center">
      <div className="text-xs text-neutral flex items-center gap-1">
        {t("extend.trade.settings.mev")}
        <Tooltip
          content={t("extend.trade.settings.mev_explained")}
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
        <Tabs
          variant="bordered"
          color="primary"
          size="sm"
          disableAnimation
          radius="lg"
          classNames={{ tabList: "border-border border-1 gap-0", tab: "min-h-0 h-5 px-2" }}
          selectedKey={typeof value === "boolean" ? (value ? "secure" : "off") : value}
          onSelectionChange={onChange as (key: Key) => void}
          aria-label={t("extend.trade.settings.mev")}
        >
          <Tab key="off" title={t("extend.trade.settings.mev_off_abbr")} />
          <Tab key="reduced" title={t("extend.trade.settings.mev_reduced_abbr")} />
          <Tab key="secure" title={t("extend.trade.settings.mev_secure_abbr")} />
        </Tabs>
      </div>
    </div>
  );
}

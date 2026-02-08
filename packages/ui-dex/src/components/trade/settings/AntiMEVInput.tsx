import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Button, Tab, Tabs, Tooltip } from "@heroui/react";
import {
  InfoIcon,
  ShieldIcon,
  ShieldOffIcon,
  ShieldPlusIcon,
  useTranslation,
} from "@liberfi/ui-base";

export function AntiMEVInput({ preset }: { preset: number }) {
  const { t } = useTranslation();

  const { control } = useFormContext();

  const antiMev = useWatch({ control, name: `presets.${preset}.antiMev` });

  return (
    <div className="flex items-center justify-between h-8">
      <h3 className="text-xs text-neutral flex items-center gap-1">
        {(!antiMev || antiMev === "off") && (
          <ShieldOffIcon width={16} height={16} className="text-neutral" />
        )}
        {antiMev === "reduced" && <ShieldIcon width={16} height={16} className="text-neutral" />}
        {(antiMev === true || antiMev === "secure") && (
          <ShieldPlusIcon width={16} height={16} className="text-neutral" />
        )}
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
      </h3>
      <Controller
        control={control}
        name={`presets.${preset}.antiMev`}
        render={({ field: { onChange, value, ref, disabled } }) => (
          <Tabs
            ref={ref}
            variant="bordered"
            color="primary"
            size="sm"
            disableAnimation
            radius="lg"
            classNames={{ tabList: "border-border border-1 gap-0", tab: "min-h-0 h-5 px-2" }}
            selectedKey={typeof value === "boolean" ? (value ? "secure" : "off") : value}
            onSelectionChange={onChange}
            isDisabled={disabled}
            aria-label={t("extend.trade.settings.mev")}
          >
            <Tab key="off" title={t("extend.trade.settings.mev_off")} />
            <Tab key="reduced" title={t("extend.trade.settings.mev_reduced")} />
            <Tab key="secure" title={t("extend.trade.settings.mev_secure")} />
          </Tabs>
        )}
      />
    </div>
  );
}

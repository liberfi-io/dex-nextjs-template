import { Key } from "react";
import { Button, Tab, Tabs, Tooltip } from "@heroui/react";
import { InfoIcon, useTranslation } from "@liberfi/ui-base";

export type AntiMEVInputProps = {
  value: boolean | "off" | "reduced" | "secure";
  onChange: (value: boolean | "off" | "reduced" | "secure") => void;
};

/**
 * Three-way segmented control for the Anti-MEV mode (off / reduced / secure).
 *
 * Previously this used `border-border` for the tabList border, which is not
 * a token defined in the HeroUI theme — the rule fell back to the browser
 * default (currentColor) and produced a mismatched, "off-theme" outline
 * compared with the rest of the preset form. The control now mirrors the
 * styling of `SwitchPreset`'s P1 / P2 / P3 segmented control:
 *   - `border-content3 border-1` for the track border
 *   - `bg-content3` highlight for the selected segment
 *   - `text-neutral` for inactive, `text-foreground` for active
 * keeping the visual language consistent across the panel.
 */
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
          size="sm"
          fullWidth
          disableAnimation
          radius="md"
          classNames={{
            base: "w-full",
            tabList: "border-content3 border-1 gap-0 p-0.5 w-full",
            tab: "min-h-0 h-6 px-1.5 data-[selected=true]:bg-content3",
            tabContent:
              "text-xs text-neutral group-data-[selected=true]:text-foreground",
            cursor: "hidden",
          }}
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

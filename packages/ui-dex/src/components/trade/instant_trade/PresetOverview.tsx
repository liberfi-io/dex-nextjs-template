import { Button, Tooltip } from "@heroui/react";
import {
  CoinsIcon,
  ShieldIcon,
  ShieldOffIcon,
  ShieldPlusIcon,
  SlippageIcon,
  useTranslation,
  ZapFastIcon,
} from "@liberfi/ui-base";
import { TradePresetValues } from "@/types";
import { formatPercent, formatPrice } from "@liberfi/core";

export type PresetOverviewProps = {
  preset: TradePresetValues;
};

export function PresetOverview({ preset }: PresetOverviewProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Tooltip
        content={t("extend.trade.settings.slippage")}
        classNames={{ content: "text-xs text-neutral py-2 px-4 max-w-xs" }}
      >
        <Button
          size="sm"
          className="bg-transparent p-0 h-5 min-h-0 w-auto min-w-0 gap-0.5 text-xs text-neutral"
          disableRipple
          startContent={<SlippageIcon width={14} height={14} />}
        >
          {formatPercent((preset.slippage ?? 0) / 100)}
        </Button>
      </Tooltip>
      <Tooltip
        content={t("extend.trade.settings.priority_fee")}
        classNames={{ content: "text-xs text-neutral py-2 px-4 max-w-xs" }}
      >
        <Button
          size="sm"
          className="bg-transparent p-0 h-5 min-h-0 w-auto min-w-0 gap-0.5 text-xs text-neutral"
          disableRipple
          startContent={<ZapFastIcon width={14} height={14} />}
        >
          {/* TODO auto priority fee */}
          {formatPrice(preset.priorityFee ?? 0)}
        </Button>
      </Tooltip>
      <Tooltip
        content={t("extend.trade.settings.tip_fee")}
        classNames={{ content: "text-xs text-neutral py-2 px-4 max-w-xs" }}
      >
        <Button
          size="sm"
          className="bg-transparent p-0 h-5 min-h-0 w-auto min-w-0 gap-0.5 text-xs text-neutral"
          disableRipple
          startContent={<CoinsIcon width={14} height={14} />}
        >
          {/* TODO auto tip fee */}
          {formatPrice(preset.tipFee ?? 0)}
        </Button>
      </Tooltip>
      <Tooltip
        content={t("extend.trade.settings.mev")}
        classNames={{ content: "text-xs text-neutral py-2 px-4 max-w-xs" }}
      >
        <Button
          size="sm"
          className="bg-transparent p-0 h-5 min-h-0 w-auto min-w-0 gap-0.5 text-xs text-neutral"
          disableRipple
          startContent={
            <>
              {(!preset.antiMev || preset.antiMev === "off") && (
                <ShieldOffIcon width={14} height={14} className="text-neutral" />
              )}
              {preset.antiMev === "reduced" && (
                <ShieldIcon width={14} height={14} className="text-neutral" />
              )}
              {(preset.antiMev === true || preset.antiMev === "secure") && (
                <ShieldPlusIcon width={14} height={14} className="text-neutral" />
              )}
            </>
          }
        >
          {(!preset.antiMev || preset.antiMev === "off") && t("extend.trade.settings.mev_off_abbr")}
          {preset.antiMev === "reduced" && t("extend.trade.settings.mev_reduced_abbr")}
          {(preset.antiMev === true || preset.antiMev === "secure") &&
            t("extend.trade.settings.mev_secure_abbr")}
        </Button>
      </Tooltip>
    </div>
  );
}

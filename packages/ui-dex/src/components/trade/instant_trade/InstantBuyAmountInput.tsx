import { ChangeEvent, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { Avatar, Button, NumberInput, Tooltip } from "@heroui/react";
import {
  formatPercent,
  formatPrice,
  getPrimaryTokenAvatar,
  getPrimaryTokenDecimals,
} from "@liberfi/core";
import {
  chainAtom,
  CoinsIcon,
  LightningIcon,
  ShieldIcon,
  ShieldOffIcon,
  ShieldPlusIcon,
  SlippageIcon,
  useAppSdk,
  useTranslation,
  ZapFastIcon,
} from "@liberfi/ui-base";
import { useTradeBuySettings } from "@/hooks";
import { defaultTradePresetValues, TradePresetValues } from "@/types";

export type InstantBuyAmountInputProps = {
  amount?: number;
  onAmountChange: (amount?: number) => void;
  preset?: number;
  onPresetChange?: (preset: number) => void;
  variant?: "default" | "bordered";
  radius?: "full" | "lg" | "md" | "sm";
  size?: "sm" | "lg";
  fullWidth?: boolean;
  className?: string;
  classNames?: {
    wrapper?: string;
  };
};

export function InstantBuyAmountInput({
  amount,
  onAmountChange,
  preset = 0,
  onPresetChange,
  variant = "default",
  radius = "full",
  size = "sm",
  fullWidth = false,
  className,
  classNames,
}: InstantBuyAmountInputProps) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const chain = useAtomValue(chainAtom);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chain), [chain]);

  const primaryTokenAvatar = useMemo(() => getPrimaryTokenAvatar(chain), [chain]);

  const buySettings = useTradeBuySettings(chain);

  const handlePresetClick = useCallback(
    (val: number) => {
      if (preset === val) {
        appSdk.events.emit("trade_settings:open", { preset });
      } else {
        onPresetChange?.(val);
      }
    },
    [appSdk, preset, onPresetChange],
  );

  const handleAmountChange = useCallback(
    (value: number | ChangeEvent<HTMLInputElement>) => {
      if (typeof value === "number") {
        if (isNaN(value)) {
          onAmountChange(undefined);
        } else {
          onAmountChange(value);
        }
      }
    },
    [onAmountChange],
  );

  return (
    <div
      className={clsx(
        "flex items-center gap-1.5 overflow-hidden px-3",
        `rounded-${radius}`,
        variant === "bordered" && "border-1 border-border ",
        variant === "default" && "bg-content2",
        className,
        classNames?.wrapper,
      )}
    >
      <div className={clsx(fullWidth ? "w-full" : "w-20")}>
        <NumberInput
          fullWidth
          value={amount}
          onChange={handleAmountChange}
          hideStepper
          minValue={0}
          formatOptions={{
            maximumFractionDigits: primaryTokenDecimals,
          }}
          startContent={<LightningIcon width={12} height={12} className="text-neutral flex-none" />}
          endContent={
            <Avatar className="w-4 h-4 bg-transparent flex-none" src={primaryTokenAvatar} />
          }
          classNames={{
            inputWrapper: clsx(
              "bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
              "w-full min-w-0 min-h-0 p-0 rounded-none",
              size === "sm" && "h-6",
              size === "lg" && "h-8",
            ),
            input: "text-sm",
          }}
          placeholder="0.0"
          aria-label={t("extend.trade.instant_buy")}
        />
      </div>

      <div className="w-px bg-border h-4"></div>

      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <Tooltip
            content={
              <PresetOverview
                presetSettings={buySettings?.presets?.[index] ?? defaultTradePresetValues}
              />
            }
            key={index}
            placement="bottom"
          >
            <Button
              className={clsx(
                "w-auto min-w-0 h-auto min-h-0 px-1 py-0.5 text-xs bg-transparent rounded",
                index === 2 && `rounded-r-${radius}`,
                {
                  "text-primary hover:bg-primary/20": index === preset,
                  "text-neutral hover:bg-content3": index !== preset,
                },
              )}
              onPress={() => handlePresetClick(index)}
            >
              {t(`extend.trade.settings.p${index + 1}`)}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

function PresetOverview({ presetSettings }: { presetSettings: TradePresetValues }) {
  const { t } = useTranslation();

  return (
    <div className="px-1 py-0.5 flex flex-col gap-1.5 text-xs text-neutral">
      <div className="w-full flex items-center justify-between gap-3">
        <SlippageIcon width={14} height={14} />
        <span>{formatPercent((presetSettings.slippage ?? 0) / 100)}</span>
      </div>
      <div className="w-full flex items-center justify-between gap-3">
        <ZapFastIcon width={14} height={14} />
        <span>{formatPrice(presetSettings.priorityFee ?? 0)}</span>
      </div>
      <div className="w-full flex items-center justify-between gap-3">
        <CoinsIcon width={14} height={14} />
        <span>{formatPrice(presetSettings.tipFee ?? 0)}</span>
      </div>
      <div className="w-full flex items-center justify-between gap-3">
        {(!presetSettings.antiMev || presetSettings.antiMev === "off") && (
          <ShieldOffIcon width={14} height={14} />
        )}
        {presetSettings.antiMev === "reduced" && <ShieldIcon width={14} height={14} />}
        {(presetSettings.antiMev === true || presetSettings.antiMev === "secure") && (
          <ShieldPlusIcon width={14} height={14} />
        )}
        <span>
          {(!presetSettings.antiMev || presetSettings.antiMev === "off") &&
            t("extend.trade.settings.mev_off_abbr")}
          {presetSettings.antiMev === "reduced" && t("extend.trade.settings.mev_reduced_abbr")}
          {(presetSettings.antiMev === true || presetSettings.antiMev === "secure") &&
            t("extend.trade.settings.mev_secure_abbr")}
        </span>
      </div>
    </div>
  );
}

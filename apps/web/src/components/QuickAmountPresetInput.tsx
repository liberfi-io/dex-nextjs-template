"use client";

import { type ReactNode, useMemo } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain } from "@liberfi.io/types";
import {
  cn,
  CoinsIcon,
  ShieldIcon,
  ShieldOffIcon,
  ShieldPlusIcon,
  SlippageIcon,
  StyledLightTabs,
  StyledNumberInput,
  StyledTooltip,
  Tab,
  TokenIcon,
  ZapFastIcon,
} from "@liberfi.io/ui";
import {
  type AmountPresetInputUIProps,
  type AmountPresetInputWidgetProps,
  getChainPresetFeatures,
  getDefaultPresetForChain,
  type TradePresetValues,
  useAmountPresetInputScript,
} from "@liberfi.io/ui-trade";
import { formatPercent, formatPrice } from "@liberfi.io/utils";

export function QuickAmountPresetInputUI({
  token,
  chain,
  amount,
  onAmountChange,
  preset,
  onPresetChange,
  onPresetClick,
  presetValues,
  size = "sm",
  className,
}: AmountPresetInputUIProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn("relative flex items-center rounded-full h-8 pr-2", className)}
      style={{
        border: "1px solid rgba(63,63,70,0.5)",
        background: "rgba(39,39,42,0.6)",
      }}
    >
      <StyledNumberInput
        key={`${chain}-${token.address}`}
        className="flex-auto min-w-0 h-full"
        fullWidth
        variant="flat"
        value={amount}
        onValueChange={(value) => onAmountChange(isNaN(value) ? undefined : value)}
        hideStepper
        minValue={0}
        formatOptions={{
          maximumFractionDigits: token.decimals,
        }}
        size={size}
        startContent={<TokenIcon symbol={token.symbol} size={16} className="flex-none" />}
        placeholder="0.0"
        aria-label={t("trade.instantTradeAmount")}
        classNames={{
          base: "h-full",
          mainWrapper: "h-full",
          inputWrapper: "!bg-transparent !shadow-none !border-0 !rounded-none h-full !min-h-0",
        }}
      />
      <div
        className="w-px self-stretch my-1.5 mx-0 flex-none"
        style={{ background: "rgba(63,63,70,0.5)" }}
      />
      <StyledLightTabs
        color="primary"
        size={size}
        selectedKey={String(preset ?? 0)}
        onSelectionChange={(key) => onPresetChange?.(Number(key))}
        classNames={{
          base: "flex-none h-full",
          tabList: "bg-transparent h-full p-1 gap-0",
          tab: "h-full text-xs px-1",
          cursor: "rounded-sm",
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <Tab
            key={String(index)}
            title={
              <StyledTooltip
                content={
                  <QuickPresetTooltip
                    label={t("trade.preset.short", { n: index + 1 })}
                    values={presetValues?.[index] ?? getDefaultPresetForChain(chain)}
                    chain={chain}
                  />
                }
                classNames={{
                  content:
                    "!p-0 !rounded-[14px] !border !border-[rgba(39,39,42,1)] !bg-[rgba(24,24,27,1)] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]",
                }}
                offset={12}
              >
                <span
                  onClick={() => {
                    if ((preset ?? 0) === index) {
                      onPresetClick?.(index);
                    }
                  }}
                >
                  {t("trade.preset.short", { n: index + 1 })}
                </span>
              </StyledTooltip>
            }
          />
        ))}
      </StyledLightTabs>
    </div>
  );
}

export function QuickAmountPresetInputWidget({
  size,
  className,
  ...scriptParams
}: AmountPresetInputWidgetProps) {
  const {
    token,
    chain,
    amount,
    handleAmountChange,
    preset,
    handlePresetChange,
    onPresetClick,
    presetValues,
  } = useAmountPresetInputScript(scriptParams);

  return (
    <QuickAmountPresetInputUI
      token={token}
      chain={chain}
      amount={amount}
      onAmountChange={handleAmountChange}
      preset={preset}
      onPresetChange={handlePresetChange}
      onPresetClick={onPresetClick}
      presetValues={presetValues}
      size={size}
      className={className}
    />
  );
}

function QuickPresetTooltip({
  label,
  values,
  chain,
}: {
  label: string;
  values: TradePresetValues;
  chain: Chain;
}) {
  const { t } = useTranslation();
  const features = useMemo(() => getChainPresetFeatures(chain), [chain]);
  const antiMev = values.antiMev && values.antiMev !== "off" ? values.antiMev : "off";
  const slippage = (values.slippage ?? 0) / 100;
  const isHighSlippage = slippage >= 0.05;
  const feeValue = features.feeType === "priorityFee" ? values.priorityFee : values.gasFee;

  return (
    <div className="flex flex-col py-2">
      <div
        className="flex items-center gap-1.5 px-3 pb-2 mb-1"
        style={{ borderBottom: "1px solid rgba(39,39,42,1)" }}
      >
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      <QuickPresetTooltipRow
        icon={<SlippageIcon width={12} height={12} className="flex-none" />}
        label={t("trade.preset.slippage")}
        value={formatPercent(slippage)}
        valueClassName={isHighSlippage ? "text-amber-400" : "text-foreground"}
      />
      <QuickPresetTooltipRow
        icon={<ZapFastIcon width={12} height={12} className="flex-none" />}
        label={t(`trade.preset.${features.feeType}`)}
        value={`${formatPrice(feeValue ?? 0)} ${features.feeUnit}`}
      />
      {features.showTipFee && (
        <QuickPresetTooltipRow
          icon={<CoinsIcon width={12} height={12} className="flex-none" />}
          label={t("trade.preset.tipFee")}
          value={`${formatPrice(values.tipFee ?? 0)} ${features.tipFeeUnit}`}
        />
      )}
      <QuickPresetTooltipRow
        icon={
          <>
            {antiMev === "off" && <ShieldOffIcon width={12} height={12} className="flex-none" />}
            {antiMev === "reduced" && <ShieldIcon width={12} height={12} className="flex-none" />}
            {antiMev === "secure" && (
              <ShieldPlusIcon width={12} height={12} className="flex-none" />
            )}
          </>
        }
        label={t("trade.preset.antiMev")}
        value={t(`trade.preset.antiMev.${antiMev}`)}
        valueClassName={cn(
          antiMev === "off" && "text-zinc-500",
          antiMev === "reduced" && "text-amber-400",
          antiMev === "secure" && "text-emerald-400",
        )}
      />
    </div>
  );
}

function QuickPresetTooltipRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-3 py-1">
      <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
        {icon}
        <span>{label}</span>
      </span>
      <span className={cn("text-xs font-medium tabular-nums", valueClassName ?? "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

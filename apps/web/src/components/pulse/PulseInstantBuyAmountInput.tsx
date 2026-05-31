import { type ReactNode, useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { cloneDeep } from "lodash-es";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { Chain } from "@liberfi.io/types";
import { PulseListType } from "@liberfi.io/ui-tokens";
import {
  type AmountPresetInputUIProps,
  getChainPresetFeatures,
  getDefaultPresetForChain,
  type PresetFormModalParams,
  type TradePresetValues,
  usePresetValues,
} from "@liberfi.io/ui-trade";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import { useTranslation } from "@liberfi.io/i18n";
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
import { formatPercent, formatPrice, getNativeToken } from "@liberfi.io/utils";
import { pulseSettingsAtom } from "../../states/pulse";

export type PulseInstantBuyAmountInputProps = {
  type: PulseListType;
} & Pick<
  AmountPresetInputUIProps,
  "radius" | "size" | "className"
>;

export function PulseInstantBuyAmountInput({
  type,
  ...inputProps
}: PulseInstantBuyAmountInputProps) {
  const { t } = useTranslation();
  const { chain } = useCurrentChain();
  const [pulseSettings, setPulseSettings] = useAtom(pulseSettingsAtom);

  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);
  const settings = useMemo(() => pulseSettings[type], [pulseSettings, type]);
  const preset0 = usePresetValues({ chain, direction: "buy", presetIndex: 0 });
  const preset1 = usePresetValues({ chain, direction: "buy", presetIndex: 1 });
  const preset2 = usePresetValues({ chain, direction: "buy", presetIndex: 2 });
  const presetValues = useMemo(() => [preset0, preset1, preset2], [preset0, preset1, preset2]);
  const { onOpen: openPresetModal } = useAsyncModal<PresetFormModalParams>("preset");

  const handlePresetClick = useCallback(
    (preset: number) => {
      openPresetModal({
        params: {
          chains: [Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE],
          defaultChain: chain,
          defaultDirection: "buy",
          defaultPresetIndex: preset,
        },
      });
    },
    [chain, openPresetModal],
  );

  const handleAmountChange = useCallback(
    (amount?: number) =>
      setPulseSettings((prev) => {
        const next = cloneDeep(prev);
        const s = next[type] ?? {};
        const ibs = s.instant_buy ?? {};
        ibs.amount = amount;
        s.instant_buy = ibs;
        next[type] = s;
        return next;
      }),
    [type, setPulseSettings],
  );

  const handlePresetChange = useCallback(
    (preset: number) =>
      setPulseSettings((prev) => {
        const next = cloneDeep(prev);
        const s = next[type] ?? {};
        const ibs = s.instant_buy ?? {};
        ibs.preset = preset;
        s.instant_buy = ibs;
        next[type] = s;
        return next;
      }),
    [type, setPulseSettings],
  );

  if (!nativeToken) return null;

  return (
    <div
      className={cn(
        "relative flex items-center rounded-full h-8 pr-2",
        inputProps.className,
      )}
      style={{
        border: "1px solid rgba(63,63,70,0.5)",
        background: "rgba(39,39,42,0.6)",
      }}
    >
      <StyledNumberInput
        key={`${chain}-${nativeToken.address}`}
        className="flex-auto min-w-0 h-full"
        fullWidth
        variant="flat"
        value={settings?.instant_buy?.amount}
        onValueChange={(value) => handleAmountChange(isNaN(value) ? undefined : value)}
        hideStepper
        minValue={0}
        formatOptions={{
          maximumFractionDigits: nativeToken.decimals,
        }}
        size={inputProps.size ?? "sm"}
        startContent={<TokenIcon symbol={nativeToken.symbol} size={16} className="flex-none" />}
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
        size={inputProps.size ?? "sm"}
        selectedKey={String(settings?.instant_buy?.preset ?? 0)}
        onSelectionChange={(key) => handlePresetChange(Number(key))}
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
                  <PulsePresetTooltip
                    label={t("trade.preset.short", { n: index + 1 })}
                    values={presetValues[index] ?? getDefaultPresetForChain(chain)}
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
                    if ((settings?.instant_buy?.preset ?? 0) === index) {
                      handlePresetClick(index);
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

function PulsePresetTooltip({
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
      <PulsePresetTooltipRow
        icon={<SlippageIcon width={12} height={12} className="flex-none" />}
        label={t("trade.preset.slippage")}
        value={formatPercent(slippage)}
        valueClassName={isHighSlippage ? "text-amber-400" : "text-foreground"}
      />
      <PulsePresetTooltipRow
        icon={<ZapFastIcon width={12} height={12} className="flex-none" />}
        label={t(`trade.preset.${features.feeType}`)}
        value={`${formatPrice(feeValue ?? 0)} ${features.feeUnit}`}
      />
      {features.showTipFee && (
        <PulsePresetTooltipRow
          icon={<CoinsIcon width={12} height={12} className="flex-none" />}
          label={t("trade.preset.tipFee")}
          value={`${formatPrice(values.tipFee ?? 0)} ${features.tipFeeUnit}`}
        />
      )}
      <PulsePresetTooltipRow
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

function PulsePresetTooltipRow({
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

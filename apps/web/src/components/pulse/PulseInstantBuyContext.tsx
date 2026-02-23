import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "@liberfi.io/i18n";
import { toast } from "@liberfi.io/ui";
import { PulseListType } from "@liberfi.io/ui-tokens";
import { SafeBigNumber } from "@liberfi.io/utils";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  useAppSdk,
  useAuthenticatedCallback,
  useWalletPrimaryTokenNetWorth,
} from "@liberfi/ui-base";
import {
  defaultTradePresetValues,
  useSwap,
  useTradeBuySettings,
} from "@liberfi/ui-dex";
import { pulseSettingsAtom } from "../../states/pulse";

type PulseInstantBuyContextType = {
  amount?: number;
  primaryTokenSymbol?: string;
  buy: (tokenAddress: string) => void;
};

const PulseInstantBuyContext = createContext<PulseInstantBuyContextType>({
  amount: undefined,
  primaryTokenSymbol: undefined,
  buy: () => {},
});

export function usePulseInstantBuy() {
  return useContext(PulseInstantBuyContext);
}

type PulseInstantBuyProviderProps = PropsWithChildren<{
  type: PulseListType;
}>;

export function PulseInstantBuyProvider({
  type,
  children,
}: PulseInstantBuyProviderProps) {
  const { chain: chainId } = useCurrentChain();
  const { t } = useTranslation();
  const appSdk = useAppSdk();

  const pulseSettings = useAtomValue(pulseSettingsAtom);
  const amount = pulseSettings[type]?.instant_buy?.amount;
  const preset = pulseSettings[type]?.instant_buy?.preset;

  const walletNetWorth = useWalletPrimaryTokenNetWorth();
  const buySettings = useTradeBuySettings(chainId);
  const { swap } = useSwap();

  const primaryTokenSymbol = useMemo(
    () => getPrimaryTokenSymbol(chainId),
    [chainId],
  );
  const primaryTokenDecimals = useMemo(
    () => getPrimaryTokenDecimals(chainId),
    [chainId],
  );
  const primaryTokenAddress = useMemo(
    () => getPrimaryTokenAddress(chainId),
    [chainId],
  );

  const presetSettings = useMemo(
    () =>
      buySettings?.presets?.[preset ?? 0] ?? defaultTradePresetValues,
    [buySettings, preset],
  );

  // keep a stable ref so the buy callback never changes identity
  const depsRef = useRef({
    t,
    appSdk,
    amount,
    primaryTokenSymbol,
    primaryTokenDecimals,
    primaryTokenAddress,
    walletNetWorth,
    presetSettings,
    swap,
  });
  depsRef.current = {
    t,
    appSdk,
    amount,
    primaryTokenSymbol,
    primaryTokenDecimals,
    primaryTokenAddress,
    walletNetWorth,
    presetSettings,
    swap,
  };

  const doBuy = useCallback(async (tokenAddress: string) => {
    const {
      t,
      appSdk,
      amount,
      primaryTokenSymbol,
      primaryTokenDecimals,
      primaryTokenAddress,
      walletNetWorth,
      presetSettings,
      swap,
    } = depsRef.current;

    if (
      !walletNetWorth?.amount ||
      !primaryTokenAddress ||
      !primaryTokenDecimals ||
      !tokenAddress
    )
      return;

    if (!amount || new SafeBigNumber(amount).lte(0.0001)) {
      toast.error(
        t("extend.trade.buy_min_amount", {
          amount: "0.0001",
          symbol: primaryTokenSymbol ?? "",
        }),
      );
      return;
    }

    if (new SafeBigNumber(walletNetWorth.amount).lt(amount)) {
      toast.error(t("extend.trade.buy_insufficient_balance"));
      appSdk.events.emit("deposit:open");
      return;
    }

    const amountInDecimals = new SafeBigNumber(amount)
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    const priorityFeeInDecimals = new SafeBigNumber(
      presetSettings.priorityFee ?? defaultTradePresetValues.priorityFee!,
    )
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    const tipFeeInDecimals = new SafeBigNumber(
      presetSettings.tipFee ?? defaultTradePresetValues.tipFee!,
    )
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    await swap({
      from: primaryTokenAddress,
      to: tokenAddress,
      amount: amountInDecimals,
      slippage:
        presetSettings.slippage ?? defaultTradePresetValues.slippage!,
      priorityFee: priorityFeeInDecimals,
      tipFee: tipFeeInDecimals,
      isAntiMev: presetSettings.antiMev,
    });
  }, []);

  const buy = useAuthenticatedCallback(doBuy, [doBuy]);

  const contextValue = useMemo(
    () => ({ amount, primaryTokenSymbol, buy }),
    [amount, primaryTokenSymbol, buy],
  );

  return (
    <PulseInstantBuyContext.Provider value={contextValue}>
      {children}
    </PulseInstantBuyContext.Provider>
  );
}

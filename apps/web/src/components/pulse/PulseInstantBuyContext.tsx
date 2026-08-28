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
} from "../../application/tokens";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  useAppSdk,
  useWalletPrimaryTokenNetWorth,
} from "@liberfi/ui-base";
import {
  defaultTradePresetValues,
  useTradeBuySettings,
} from "@liberfi/ui-dex";
import { useSwap, type SwapPhase } from "@liberfi.io/ui-trade";
import {
  useAuthCallback,
  useConnectedWallet,
} from "@liberfi.io/wallet-connector";
import { pulseSettingsAtom } from "../../states/pulse";

type PulseInstantBuyContextType = {
  amount?: number;
  primaryTokenSymbol?: string;
  buy: (tokenAddress: string) => Promise<void>;
};

const PulseInstantBuyContext = createContext<PulseInstantBuyContextType>({
  amount: undefined,
  primaryTokenSymbol: undefined,
  buy: async () => {},
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
  const wallet = useConnectedWallet(chainId);

  const pulseSettings = useAtomValue(pulseSettingsAtom);
  const amount = pulseSettings[type]?.instant_buy?.amount;
  const preset = pulseSettings[type]?.instant_buy?.preset;

  const walletNetWorth = useWalletPrimaryTokenNetWorth();
  const buySettings = useTradeBuySettings(chainId);
  const handleSwapError = useCallback(
    (error: Error, phase: SwapPhase) => {
      const phaseLabel = t(`trade.swap.phase.${phase}`);
      const message = error.message
        ? t("trade.swap.error", { phase: phaseLabel, reason: error.message })
        : t("trade.swap.errorUnknown", { phase: phaseLabel });
      toast.error(message);
    },
    [t],
  );

  const { swap } = useSwap({
    onSubmitted: ({ txHash }) => {
      toast.progress({
        id: txHash,
        type: "success",
        message: t("trade.swap.transactionSubmitted"),
        progress: true,
        duration: 65_000,
      });
    },
    onError: handleSwapError,
  });

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
    chainId,
    walletNetWorth,
    presetSettings,
    wallet,
    swap,
  });
  depsRef.current = {
    t,
    appSdk,
    amount,
    primaryTokenSymbol,
    primaryTokenDecimals,
    primaryTokenAddress,
    chainId,
    walletNetWorth,
    presetSettings,
    wallet,
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
      chainId,
      walletNetWorth,
      presetSettings,
      wallet,
      swap,
    } = depsRef.current;

    if (
      !walletNetWorth?.amount ||
      !wallet ||
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
      chain: chainId,
      wallet,
      input: primaryTokenAddress,
      output: tokenAddress,
      amount: amountInDecimals,
      slippage:
        presetSettings.slippage ?? defaultTradePresetValues.slippage!,
      priorityFee: priorityFeeInDecimals,
      tipFee: tipFeeInDecimals,
      isAntiMev:
        typeof presetSettings.antiMev === "boolean"
          ? presetSettings.antiMev
          : presetSettings.antiMev !== "off",
    });
  }, []);

  const buy = useAuthCallback(doBuy, [doBuy]);

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

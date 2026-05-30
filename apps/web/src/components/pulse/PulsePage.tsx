"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAtom } from "jotai";
import { cloneDeep } from "lodash-es";
import { cn, HorizontalScrollContainer, PauseIcon, toast } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain, SOLANA_TOKEN_PROTOCOLS, Token } from "@liberfi.io/types";
import { ChainSelectWidget, useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  PulseNewListWidget,
  PulseFinalStretchListWidget,
  PulseMigratedListWidget,
  PulseListType,
  PulseList,
  usePulseNewListScript,
  usePulseFinalStretchListScript,
  usePulseMigratedListScript,
  TokenListFilterWidget,
  type TokenListFiltersType,
} from "@liberfi.io/ui-tokens";
import {
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  useShowHeader,
  useRouter,
} from "@liberfi/ui-base";
import { tokenDetailRoute } from "@liberfi/ui-dex/libs/routes";
import { useSwitchEvmWalletsToChain } from "@liberfi.io/wallet-connector";
import { chainDisplayName } from "@liberfi.io/utils";
import { useChainSwitchUrlHandler } from "../../hooks/useChainSwitchUrlHandler";
import { chainQueryValue } from "../../libs/chainQuery";
import { PulseInstantBuyAmountInput } from "./PulseInstantBuyAmountInput";
import { PulseInstantBuyProvider } from "./PulseInstantBuyContext";
import { PulseInstantBuy } from "./PulseInstantBuy";
import { isPulseSupportedChain } from "../../lib/pulse";
import { pulseSettingsAtom } from "../../states/pulse";

const PULSE_TAB_I18N_KEYS = {
  new: "extend.pulse.new",
  final_stretch: "extend.pulse.final_stretch",
  migrated: "extend.pulse.migrated",
} as const;

const PULSE_FILTER_RESOLUTION = "24h";

export function PulsePage() {
  useShowHeader();
  useShowBottomNavigationBar("tablet");
  useSetBottomNavigationBarActiveKey("pulse");

  const { t } = useTranslation();
  const { chain: chainId } = useCurrentChain();
  const { navigate } = useRouter();
  const switchChain = useSwitchEvmWalletsToChain();
  const onChainSwitchedUrl = useChainSwitchUrlHandler();
  const isPulseSupported = isPulseSupportedChain(chainId);
  const [pulseSettings, setPulseSettings] = useAtom(pulseSettingsAtom);

  useEffect(() => {
    if (!isPulseSupported) {
      const chainQuery = chainQueryValue(chainId);
      navigate(chainQuery ? `/?chain=${chainQuery}` : "/", { replace: true });
    }
  }, [chainId, isPulseSupported, navigate]);

  const [type, setType] = useState<PulseListType>("new");
  const [isMobileListPaused, setIsMobileListPaused] = useState(false);
  const [pulseListResumeNonce, setPulseListResumeNonce] = useState(0);
  const [activeInstantBuyCount, setActiveInstantBuyCount] = useState(0);

  useEffect(() => {
    setIsMobileListPaused(false);
  }, [type]);

  const handleSelectToken = useCallback(
    (token: Token) => {
      navigate(tokenDetailRoute(chainId, token.address));
    },
    [navigate, chainId],
  );

  const filterProtocols = useMemo(
    () => (chainId === Chain.SOLANA ? SOLANA_TOKEN_PROTOCOLS : undefined),
    [chainId],
  );

  const handleFiltersChange = useCallback(
    (listType: PulseListType, filters?: TokenListFiltersType) =>
      setPulseSettings((prev) => {
        const next = cloneDeep(prev);
        const settings = next[listType] ?? {};
        settings.filters = filters;
        next[listType] = settings;
        return next;
      }),
    [setPulseSettings],
  );

  const renderHeaderExtra = useCallback(
    (listType: PulseListType) => (
      <>
        <PulseInstantBuyAmountInput type={listType} size="sm" className="max-w-55" />
        <TokenListFilterWidget
          badgePlacement="icon"
          desktopOverlay="modal"
          iconOnly
          triggerVariant="plain"
          protocols={filterProtocols}
          resolution={PULSE_FILTER_RESOLUTION}
          filters={pulseSettings[listType]?.filters}
          onFiltersChange={(filters) => handleFiltersChange(listType, filters)}
        />
      </>
    ),
    [filterProtocols, handleFiltersChange, pulseSettings],
  );

  const renderNewHeaderExtra = useMemo(
    () => renderHeaderExtra("new"),
    [renderHeaderExtra],
  );
  const renderFinalStretchHeaderExtra = useMemo(
    () => renderHeaderExtra("final_stretch"),
    [renderHeaderExtra],
  );
  const renderMigratedHeaderExtra = useMemo(
    () => renderHeaderExtra("migrated"),
    [renderHeaderExtra],
  );

  const handleInstantBuyStart = useCallback(() => {
    setActiveInstantBuyCount((count) => count + 1);
    setIsMobileListPaused(true);
  }, []);

  const handleInstantBuySettled = useCallback(() => {
    setIsMobileListPaused(false);
    setPulseListResumeNonce((nonce) => nonce + 1);
    setActiveInstantBuyCount((count) => Math.max(0, count - 1));
  }, []);

  const renderItemAction = useCallback(
    (token: Token) => (
      <PulseInstantBuy
        token={token}
        onStart={handleInstantBuyStart}
        onSettled={handleInstantBuySettled}
      />
    ),
    [handleInstantBuySettled, handleInstantBuyStart],
  );

  const isInstantBuying = activeInstantBuyCount > 0;

  if (!isPulseSupported) return null;

  return (
    <div className="w-full h-full max-w-[1920px] mx-auto">
      <div className="w-full h-full flex flex-col gap-3 sm:gap-4 py-4 lg:px-4 min-h-0">
        <div className="hidden lg:flex flex-none h-8 items-center">
          <h1 className="text-sm sm:text-base font-medium text-foreground">
            {t("extend.pulse.title")}
          </h1>
        </div>

        <div
          className={cn(
            "lg:hidden w-full mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center sm:gap-0 flex-none sm:h-8 max-lg:px-4",
            "max-w-362 sm:max-w-403",
          )}
        >
          <div className="flex justify-between items-center w-full sm:w-auto gap-4">
            <HorizontalScrollContainer
              className="flex-auto min-w-0 max-sm:h-8"
              classNames={{
                content: "items-center gap-4 sm:gap-6 whitespace-nowrap",
                leftArrow: "from-content1/60",
                rightArrow: "from-content1/60",
              }}
            >
              {Object.entries(PULSE_TAB_I18N_KEYS).map(([tab, key]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setType(tab as PulseListType)}
                  className={cn(
                    "text-sm sm:text-base font-medium transition-all cursor-pointer",
                    type === tab
                      ? "text-foreground hover:opacity-70"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {t(key)}
                </button>
              ))}
            </HorizontalScrollContainer>

            <div className="flex-none sm:hidden flex justify-end items-center gap-2">
              <ChainSelectWidget
                size="sm"
                className="sm:hidden"
                onSwitchChain={switchChain}
                candidates={[Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE]}
                onSuccess={(chain) => {
                  onChainSwitchedUrl(chain);
                  toast.success(
                    t("common.chainSwitched", {
                      chain: chainDisplayName(chain),
                    }),
                  );
                }}
                onError={(e) =>
                  toast.error(e instanceof Error ? e.message : t("common.chainSwitchFailed"))
                }
              />
            </div>
          </div>

          <div className="sm:hidden flex justify-end items-center gap-2 pt-2 relative z-20">
            <div className="w-6 h-8 flex items-center justify-center flex-none">
              {isMobileListPaused && <PauseIcon className="w-4 h-4 text-primary" />}
            </div>
            <PulseInstantBuyAmountInput
              key={type}
              type={type}
              size="sm"
              className="max-w-50"
            />
            <TokenListFilterWidget
              badgePlacement="icon"
              iconOnly
              protocols={filterProtocols}
              resolution={PULSE_FILTER_RESOLUTION}
              filters={pulseSettings[type]?.filters}
              onFiltersChange={(filters) => handleFiltersChange(type, filters)}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full flex flex-col gap-2 lg:gap-4">
          {/* three-column list layout */}
          <div className="flex-1 min-h-0 w-full flex justify-between">
            <PulseInstantBuyProvider key={type} type={type}>
              <MobilePulseList
                type={type}
                chain={chainId}
                renderItemAction={renderItemAction}
                onSelectToken={handleSelectToken}
                onPauseChange={setIsMobileListPaused}
                forceResumeNonce={pulseListResumeNonce}
                forcePaused={isInstantBuying}
                filters={pulseSettings[type]?.filters}
              />
            </PulseInstantBuyProvider>

            <div className="flex-1 h-full max-lg:hidden">
              <PulseInstantBuyProvider type="new">
                <PulseNewListWidget
                  chain={chainId}
                  filters={pulseSettings.new?.filters}
                  title={t("extend.pulse.new")}
                  renderHeaderExtra={renderNewHeaderExtra}
                  renderItemAction={renderItemAction}
                  onSelectToken={handleSelectToken}
                  className="border-r-0 rounded-lg lg:rounded-r-none"
                />
              </PulseInstantBuyProvider>
            </div>
            <div className="flex-1 h-full max-lg:hidden">
              <PulseInstantBuyProvider type="final_stretch">
                <PulseFinalStretchListWidget
                  chain={chainId}
                  filters={pulseSettings.final_stretch?.filters}
                  title={t("extend.pulse.final_stretch")}
                  renderHeaderExtra={renderFinalStretchHeaderExtra}
                  renderItemAction={renderItemAction}
                  onSelectToken={handleSelectToken}
                  className="border-r-0 rounded-lg lg:rounded-none"
                />
              </PulseInstantBuyProvider>
            </div>
            <div className="flex-1 h-full max-lg:hidden">
              <PulseInstantBuyProvider type="migrated">
                <PulseMigratedListWidget
                  chain={chainId}
                  filters={pulseSettings.migrated?.filters}
                  title={t("extend.pulse.migrated")}
                  renderHeaderExtra={renderMigratedHeaderExtra}
                  renderItemAction={renderItemAction}
                  onSelectToken={handleSelectToken}
                  className="rounded-lg lg:rounded-l-none"
                />
              </PulseInstantBuyProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type MobilePulseListProps = {
  type: PulseListType;
  chain: Chain;
  filters?: TokenListFiltersType;
  renderItemAction: (token: Token) => ReactNode;
  onSelectToken: (token: Token) => void;
  onPauseChange: (isPaused: boolean) => void;
  forceResumeNonce: number;
  forcePaused: boolean;
};

function MobilePulseList({ type, ...props }: MobilePulseListProps) {
  if (type === "final_stretch") {
    return <MobilePulseFinalStretchList {...props} />;
  }
  if (type === "migrated") {
    return <MobilePulseMigratedList {...props} />;
  }
  return <MobilePulseNewList {...props} />;
}

type MobilePulseTypedListProps = Omit<MobilePulseListProps, "type">;

function MobilePulseNewList({
  chain,
  filters,
  renderItemAction,
  onSelectToken,
  onPauseChange,
  forceResumeNonce,
  forcePaused,
}: MobilePulseTypedListProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { tokens, isLoading } = usePulseNewListScript({
    chain,
    filters,
    isPaused,
  });
  const lastForceResumeNonceRef = useRef(forceResumeNonce);

  useEffect(() => {
    if (!forcePaused) return;
    setIsPaused(true);
    onPauseChange(true);
  }, [forcePaused, onPauseChange]);

  useEffect(() => {
    if (lastForceResumeNonceRef.current === forceResumeNonce) return;
    lastForceResumeNonceRef.current = forceResumeNonce;
    if (forcePaused) return;
    setIsPaused(false);
    onPauseChange(false);
  }, [forcePaused, forceResumeNonce, onPauseChange]);

  const handlePauseChange = useCallback(
    (paused: boolean) => {
      const nextPaused = forcePaused || paused;
      setIsPaused(nextPaused);
      onPauseChange(nextPaused);
    },
    [forcePaused, onPauseChange],
  );

  return (
    <PulseList
      title=""
      tokens={tokens}
      isLoading={isLoading}
      renderItemAction={renderItemAction}
      onSelectToken={onSelectToken}
      onPauseChange={handlePauseChange}
      hideHeader
      className="rounded-lg lg:hidden"
    />
  );
}

function MobilePulseFinalStretchList({
  chain,
  filters,
  renderItemAction,
  onSelectToken,
  onPauseChange,
  forceResumeNonce,
  forcePaused,
}: MobilePulseTypedListProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { tokens, isLoading } = usePulseFinalStretchListScript({
    chain,
    filters,
    isPaused,
  });
  const lastForceResumeNonceRef = useRef(forceResumeNonce);

  useEffect(() => {
    if (!forcePaused) return;
    setIsPaused(true);
    onPauseChange(true);
  }, [forcePaused, onPauseChange]);

  useEffect(() => {
    if (lastForceResumeNonceRef.current === forceResumeNonce) return;
    lastForceResumeNonceRef.current = forceResumeNonce;
    if (forcePaused) return;
    setIsPaused(false);
    onPauseChange(false);
  }, [forcePaused, forceResumeNonce, onPauseChange]);

  const handlePauseChange = useCallback(
    (paused: boolean) => {
      const nextPaused = forcePaused || paused;
      setIsPaused(nextPaused);
      onPauseChange(nextPaused);
    },
    [forcePaused, onPauseChange],
  );

  return (
    <PulseList
      title=""
      tokens={tokens}
      isLoading={isLoading}
      renderItemAction={renderItemAction}
      onSelectToken={onSelectToken}
      onPauseChange={handlePauseChange}
      hideHeader
      className="rounded-lg lg:hidden"
    />
  );
}

function MobilePulseMigratedList({
  chain,
  filters,
  renderItemAction,
  onSelectToken,
  onPauseChange,
  forceResumeNonce,
  forcePaused,
}: MobilePulseTypedListProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { tokens, isLoading } = usePulseMigratedListScript({
    chain,
    filters,
    isPaused,
  });
  const lastForceResumeNonceRef = useRef(forceResumeNonce);

  useEffect(() => {
    if (!forcePaused) return;
    setIsPaused(true);
    onPauseChange(true);
  }, [forcePaused, onPauseChange]);

  useEffect(() => {
    if (lastForceResumeNonceRef.current === forceResumeNonce) return;
    lastForceResumeNonceRef.current = forceResumeNonce;
    if (forcePaused) return;
    setIsPaused(false);
    onPauseChange(false);
  }, [forcePaused, forceResumeNonce, onPauseChange]);

  const handlePauseChange = useCallback(
    (paused: boolean) => {
      const nextPaused = forcePaused || paused;
      setIsPaused(nextPaused);
      onPauseChange(nextPaused);
    },
    [forcePaused, onPauseChange],
  );

  return (
    <PulseList
      title=""
      tokens={tokens}
      isLoading={isLoading}
      renderItemAction={renderItemAction}
      onSelectToken={onSelectToken}
      onPauseChange={handlePauseChange}
      hideHeader
      className="rounded-lg lg:hidden"
    />
  );
}

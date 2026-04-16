"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useResizeObserver, useValueRef } from "@liberfi.io/hooks";
import { useTranslation } from "@liberfi.io/i18n";
import { useDexClient } from "@liberfi.io/react";
import { Chain, SOLANA_TOKEN_PROTOCOLS, Token } from "@liberfi.io/types";
import { Button, cn, HorizontalScrollContainer, Link, SettingsIcon, toast } from "@liberfi.io/ui";
import { ChainSelectWidget, useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  NewTokenListWidget,
  StockTokenListWidget,
  TokenListFilterWidget,
  TokenListFiltersType,
  TokenListResolution,
  TokenListResolutionSelectorWidget,
  TrendingTokenListWidget,
} from "@liberfi.io/ui-tokens";
import { capitalize, chainSlug, getNativeToken, txExplorerUrl } from "@liberfi.io/utils";
import { useSwitchChain } from "@liberfi.io/wallet-connector";
import { CombinedPulseList } from "./CombinedPulseList";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import {
  AmountPresetInputWidget,
  InstantTradeListButtonWidget,
  InstantTradeSwapProvider,
  type PresetFormModalParams,
  type SwapResult,
  type SwapPhase,
} from "@liberfi.io/ui-trade";

type ListTab = "trending" | "pulse" | "stocks" | "new";

const SOLANA_TABS: ListTab[] = ["trending", "pulse", "stocks"];
const EVM_TABS: ListTab[] = ["trending", "new"];

const TAB_I18N_KEYS = {
  trending: "tokens.listType.trending",
  pulse: "tokens.listType.pulse",
  stocks: "tokens.listType.stocks",
  new: "tokens.listType.new",
} as const;

function useTabs(chain: Chain) {
  const tabs = chain === Chain.SOLANA ? SOLANA_TABS : EVM_TABS;
  const [activeTab, setActiveTab] = useState<ListTab>(tabs[0]);

  useEffect(() => {
    setActiveTab((prev) => (tabs.includes(prev) ? prev : tabs[0]));
  }, [tabs]);

  return { tabs, activeTab, setActiveTab };
}

export function CombinedTokenList() {
  const { t } = useTranslation();

  const router = useRouter();

  const { client } = useDexClient();

  const { chain } = useCurrentChain();
  const chainRef = useValueRef(chain);

  const switchChain = useSwitchChain();

  const ref = useRef<HTMLDivElement>(null);
  const { height } = useResizeObserver<HTMLDivElement>({ ref });

  const [filters, setFilters] = useState<TokenListFiltersType | undefined>();
  const [resolution, setResolution] = useState<TokenListResolution>("24h");
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

  const { tabs, activeTab, setActiveTab } = useTabs(chain);
  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);

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
    [openPresetModal, chain],
  );

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

  const handleSwapSubmitted = useCallback(
    (result: SwapResult) => {
      const currentChain = chainRef.current;
      if (!currentChain) return;

      const { txHash } = result;
      const jobId = (result.extra?.jobId as string) ?? txHash;

      toast.progress({
        id: txHash,
        type: "success",
        message: t("trade.swap.transactionSubmitted"),
        progress: true,
        duration: 65_000,
      });

      const explorerAction = (
        <Button
          variant="solid"
          color="default"
          as={Link}
          href={txExplorerUrl(currentChain, txHash)}
          target="_blank"
          size="sm"
        >
          {t("trade.swap.viewOnExplorer")}
        </Button>
      );

      client
        .checkTxSuccess(currentChain, jobId)
        .then((success) => {
          toast.update(txHash, {
            type: success ? "success" : "error",
            message: success
              ? t("trade.swap.transactionConfirmed")
              : t("trade.swap.transactionFailed"),
            action: explorerAction,
            duration: 5_000,
          });
        })
        .catch((err: unknown) => {
          const reason = err instanceof Error ? err.message : undefined;
          toast.update(txHash, {
            type: "error",
            message: reason ?? t("trade.swap.transactionFailed"),
            action: explorerAction,
            duration: 5_000,
          });
        });
    },
    [client, t],
  );

  const handleSelectToken = useCallback(
    (token: Token) => {
      const slug = chainSlug(token.chain);
      if (slug) {
        router.push(`/tokens/${slug}/${token.address}`);
      }
    },
    [router],
  );

  const showTokenListControls = activeTab !== "pulse";

  const tokenListContent = useMemo(() => {
    const commonProps = { chain, resolution, filters, height };

    switch (activeTab) {
      case "trending":
        return (
          <TrendingTokenListWidget
            {...commonProps}
            onSelectToken={handleSelectToken}
            ActionsComponent={({ token }) => (
              <div className="w-full h-full relative">
                {nativeToken && (
                  <InstantTradeListButtonWidget
                    id="token-list"
                    chain={chain}
                    token={nativeToken}
                    output={token.address}
                    size="sm"
                    radius="full"
                    className="w-auto absolute right-0 top-1/2 -translate-y-1/2"
                  />
                )}
              </div>
            )}
          />
        );
      case "stocks":
        return (
          <StockTokenListWidget
            {...commonProps}
            onSelectToken={handleSelectToken}
            ActionsComponent={({ token }) => (
              <div className="w-full h-full relative">
                {nativeToken && (
                  <InstantTradeListButtonWidget
                    id="token-list"
                    chain={chain}
                    token={nativeToken}
                    output={token.address}
                    size="sm"
                    radius="full"
                    className="w-auto absolute right-0 top-1/2 -translate-y-1/2"
                  />
                )}
              </div>
            )}
          />
        );
      case "new":
        return (
          <NewTokenListWidget
            {...commonProps}
            onSelectToken={handleSelectToken}
            ActionsComponent={({ token }) => (
              <div className="w-full h-full relative">
                {nativeToken && (
                  <InstantTradeListButtonWidget
                    id="token-list"
                    chain={chain}
                    token={nativeToken}
                    output={token.address}
                    size="sm"
                    radius="full"
                    className="w-auto absolute right-0 top-1/2 -translate-y-1/2"
                  />
                )}
              </div>
            )}
          />
        );
      case "pulse":
        return <CombinedPulseList chain={chain} onSelectToken={handleSelectToken} />;
    }
  }, [activeTab, chain, resolution, filters, height, nativeToken, handleSelectToken]);

  return (
    <InstantTradeSwapProvider
      chain={chain}
      onSwapSubmitted={handleSwapSubmitted}
      onSwapError={handleSwapError}
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 p-4 min-h-0">
        <div
          className={cn(
            "w-full mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 flex-none sm:h-8",
            "max-w-379 sm:max-w-403",
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
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-sm sm:text-base font-medium transition-all cursor-pointer",
                    activeTab === tab
                      ? "text-foreground hover:opacity-70"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {t(TAB_I18N_KEYS[tab])}
                </button>
              ))}
            </HorizontalScrollContainer>

            <div className="flex-none sm:hidden flex justify-end items-center gap-2">
              <ChainSelectWidget
                size="sm"
                className="sm:hidden"
                onSwitchChain={switchChain}
                candidates={[Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE]}
                onSuccess={(c) =>
                  toast.success(
                    t("common.chainSwitched", {
                      chain: capitalize(chainSlug(c) ?? "") ?? "",
                    }),
                  )
                }
                onError={(e) =>
                  toast.error(e instanceof Error ? e.message : t("common.chainSwitchFailed"))
                }
              />
              <Button
                isIconOnly
                radius="full"
                size="sm"
                aria-label={t("tokens.listHeader.filter")}
                onPress={() => setIsMobileControlsOpen((prev) => !prev)}
                className="sm:hidden text-neutral hover:text-foreground transition-colors bg-transparent"
              >
                <SettingsIcon width={20} height={20} />
              </Button>
            </div>
          </div>

          {/* desktop: always visible as inline controls */}
          <div className="hidden sm:flex justify-end items-center gap-6">
            {showTokenListControls && (
              <>
                <TokenListResolutionSelectorWidget
                  resolution={resolution}
                  onResolutionChange={setResolution}
                />
                <TokenListFilterWidget
                  protocols={chain === Chain.SOLANA ? SOLANA_TOKEN_PROTOCOLS : undefined}
                  resolution={resolution}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </>
            )}
            {nativeToken && (
              <AmountPresetInputWidget
                id="token-list"
                chain={chain}
                token={nativeToken}
                size="sm"
                className="max-w-55"
                onPresetClick={handlePresetClick}
              />
            )}
          </div>

          {/* mobile: expand/collapse — GPU-only opacity+transform, no layout animation */}
          <div
            className={cn(
              "sm:hidden flex justify-end items-center gap-2 pt-2 relative z-20",
              !isMobileControlsOpen && "invisible h-0 overflow-hidden",
            )}
            style={{
              opacity: isMobileControlsOpen ? 1 : 0,
              transform: isMobileControlsOpen
                ? "translateY(0) scale(1)"
                : "translateY(-4px) scale(0.98)",
              transition:
                "opacity 150ms ease-out, transform 150ms ease-out",
              willChange: "opacity, transform",
            }}
          >
            {showTokenListControls && (
              <>
                <TokenListResolutionSelectorWidget
                  resolution={resolution}
                  onResolutionChange={setResolution}
                />
                <TokenListFilterWidget
                  protocols={chain === Chain.SOLANA ? SOLANA_TOKEN_PROTOCOLS : undefined}
                  resolution={resolution}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </>
            )}
            {nativeToken && (
              <AmountPresetInputWidget
                id="token-list"
                chain={chain}
                token={nativeToken}
                size="sm"
                className="max-w-50"
                onPresetClick={handlePresetClick}
              />
            )}
          </div>
        </div>

        <div className="w-full flex-auto flex flex-col min-h-0" ref={ref}>
          {tokenListContent}
        </div>
        </div>
      </div>
    </InstantTradeSwapProvider>
  );
}

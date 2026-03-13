"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useResizeObserver } from "@liberfi.io/hooks";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain, SOLANA_TOKEN_PROTOCOLS } from "@liberfi.io/types";
import { Button, cn, HorizontalScrollContainer, SettingsIcon, toast } from "@liberfi.io/ui";
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
import { capitalize, chainSlug, getNativeToken } from "@liberfi.io/utils";
import { useSwitchChain } from "@liberfi.io/wallet-connector";
import { CombinedPulseList } from "./CombinedPulseList";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import {
  AmountPresetInputWidget,
  InstantTradeListButtonWidget,
  InstantTradeSwapProvider,
  PresetFormModalParams,
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

  const { chain } = useCurrentChain();

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

  const showTokenListControls = activeTab !== "pulse";

  const tokenListContent = useMemo(() => {
    const commonProps = { chain, resolution, filters, height };

    switch (activeTab) {
      case "trending":
        return (
          <TrendingTokenListWidget
            {...commonProps}
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
        return <CombinedPulseList chain={chain} />;
    }
  }, [activeTab, chain, resolution, filters, height]);

  return (
    <div className="w-full h-full flex flex-col gap-3 sm:gap-4 p-4">
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
                  "text-sm sm:text-base font-medium transition-colors cursor-pointer",
                  activeTab === tab ? "text-foreground" : "text-neutral hover:text-foreground/80",
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

        <div
          className={cn(
            "justify-start sm:justify-end items-center gap-2 sm:gap-6",
            isMobileControlsOpen ? "flex" : "hidden sm:flex",
          )}
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
              className="max-w-55"
              onPresetClick={handlePresetClick}
            />
          )}
        </div>
      </div>

      <InstantTradeSwapProvider chain={chain}>
        <div className="w-full flex-auto flex flex-col min-h-0" ref={ref}>
          {tokenListContent}
        </div>
      </InstantTradeSwapProvider>
    </div>
  );
}

import { useTranslation } from "@liberfi.io/i18n";
import { SOLANA_TOKEN_PROTOCOLS } from "@liberfi.io/types";
import { clsx, SettingsIcon, StyledBadge, StyledButton, StyledTabs, Tab } from "@liberfi.io/ui";
import {
  TokenListFilterModal,
  TokenListFilterPopover,
  TokenListFiltersType,
  TokenListResolution,
  TokenListResolutionSelector,
} from "@liberfi.io/ui-tokens";
import { Chain } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { ChevronUpIcon } from "@liberfi/ui-base";
import { InstantBuyAmountInput, SwitchWallet } from "@liberfi/ui-dex";
import { Key, useCallback, useMemo, useState } from "react";


export type TokenListHeaderProps = {
  /** token list type */
  type: "trending" | "stocks";
  /** callback function when token list type changes */
  onTypeChange: (type: "trending" | "stocks") => void;
  /** token list resolution */
  resolution: TokenListResolution;
  /** callback function when token list resolution changes */
  onResolutionChange: (resolution: TokenListResolution) => void;
  /** token list filters */
  filters?: TokenListFiltersType;
  /** callback function when token list filters changes */
  onFiltersChange: (filters?: TokenListFiltersType) => void;
  /** instant buy amount */
  instantBuyAmount?: number;
  /** callback function when instant buy amount changes */
  onInstantBuyAmountChange: (amount?: number) => void;
  /** instant buy preset */
  instantBuyPreset?: number;
  /** callback function when instant buy preset changes */
  onInstantBuyPresetChange: (preset: number) => void;
};

export function TokenListHeader({
  type,
  resolution,
  filters,
  instantBuyAmount,
  instantBuyPreset,
  onTypeChange,
  onResolutionChange,
  onFiltersChange,
  onInstantBuyAmountChange,
  onInstantBuyPresetChange,
}: TokenListHeaderProps) {
  const { t } = useTranslation();

  const { chain: chainId } = useCurrentChain();

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const handleSettingsMenuToggle = useCallback(() => {
    setIsSettingsMenuOpen((prev) => !prev);
  }, []);

  const isEmptyFilters = useMemo(() => {
    return Object.values(filters || {}).every((value) => value === undefined);
  }, [filters]);

  return (
    <div className="flex-none flex flex-col w-full max-sm:pt-2.5 max-w-379 sm:max-w-403 mx-auto">
      <div className="w-full flex justify-between items-center relative bg-background z-10 max-sm:px-3 overflow-x-scroll">
        {/* switch token list type */}
        <StyledTabs
          variant="plain"
          selectedKey={type}
          onSelectionChange={onTypeChange as (key: Key) => void}
          classNames={{ tabContent: "text-base sm:text-xl" }}
        >
          <Tab key="trending" title={t("extend.token_list.discover.trending")} />
          {/* only show stocks tab on solana */}
          {chainId === Chain.SOLANA && (
            <Tab key="stocks" title={t("extend.token_list.types.stocks")} />
          )}
        </StyledTabs>

        {/* desktop filters & resolution selector etc... */}
        <div className="max-sm:hidden flex-none flex justify-end items-center gap-4">
          {/* desktop resolution selector */}
          <TokenListResolutionSelector
            resolution={resolution}
            onResolutionChange={onResolutionChange}
          />
          {/* desktop filters */}
          <TokenListFilterPopover
            placement="bottom-end"
            protocols={SOLANA_TOKEN_PROTOCOLS}
            resolution={resolution}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
          {/* desktop wallet */}
          <SwitchWallet />
          {/* desktop instant buy amount input */}
          <InstantBuyAmountInput
            radius="full"
            size="lg"
            amount={instantBuyAmount}
            preset={instantBuyPreset}
            onAmountChange={onInstantBuyAmountChange}
            onPresetChange={onInstantBuyPresetChange}
          />
        </div>

        {/* toggle settings menu on mobile */}
        <StyledButton
          variant="bordered"
          size="sm"
          radius="full"
          onPress={handleSettingsMenuToggle}
          className={clsx(
            "sm:hidden border-border text-neutral",
            isSettingsMenuOpen && "w-8 min-w-8 h-8 min-h-8 p-0",
          )}
          startContent={
            !isSettingsMenuOpen ? (
              <span className="text-primary">{t(`common.resolution.${resolution}`)}</span>
            ) : undefined
          }
          endContent={
            !isSettingsMenuOpen ? (
              isEmptyFilters ? (
                <SettingsIcon width={18} height={18} />
              ) : (
                <StyledBadge color="primary" size="sm" content="" shape="circle">
                  <SettingsIcon width={18} height={18} />
                </StyledBadge>
              )
            ) : undefined
          }
        >
          {isSettingsMenuOpen ? (
            <ChevronUpIcon width={18} height={18} />
          ) : (
            <span className="text-neutral">
              {t(`extend.trade.settings.p${(instantBuyPreset ?? 0) + 1}`)}
            </span>
          )}
        </StyledButton>
      </div>

      {/* settings menu on mobile */}
      <div
        className={clsx("w-full overflow-hidden flex flex-col gap-4 sm:hidden", {
          "max-h-full translate-y-0 opacity-100": isSettingsMenuOpen,
          "max-h-0 -translate-y-4 opacity-0": !isSettingsMenuOpen,
        })}
      >
        <div className="w-fit flex justify-end items-center gap-4 max-sm:pl-3">
          {/* mobile resolution selector */}
          <TokenListResolutionSelector
            resolution={resolution}
            onResolutionChange={onResolutionChange}
          />
          {/* mobile filters */}
          <TokenListFilterModal
            protocols={SOLANA_TOKEN_PROTOCOLS}
            resolution={resolution}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
        <div className="w-full flex justify-end items-center gap-4 max-sm:px-3">
          <SwitchWallet />
          <InstantBuyAmountInput
            radius="full"
            size="lg"
            amount={instantBuyAmount}
            preset={instantBuyPreset}
            onAmountChange={onInstantBuyAmountChange}
            onPresetChange={onInstantBuyPresetChange}
            className="lg:hidden"
          />
        </div>
      </div>
    </div>
  );
}

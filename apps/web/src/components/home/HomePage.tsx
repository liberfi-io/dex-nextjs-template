"use client";

import {
  hideHeaderOnLayoutAtom,
  useRouter,
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  chainAtom,
} from "@liberfi/ui-base";
import { clsx } from "@liberfi.io/ui";
import { useSetAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { TokenListHeader } from "./TokenListHeader";
import { useResizeObserver } from "@liberfi.io/hooks";
import {
  StockTokenListWidget,
  TokenListFiltersType,
  TokenListResolution,
  TrendingTokenListWidget,
} from "@liberfi.io/ui-tokens";
import { chainSlug } from "@liberfi.io/utils";
import { Chain, Token } from "@liberfi.io/types";
import { AppRoute } from "@liberfi/ui-dex/libs/routes";
import { InstantBuyProvider } from "./InstantBuyContext";
import { InstantBuy } from "./InstsantBuy";

export function HomePage() {
  const chainId = useAtomValue(chainAtom);

  // hide header on mobile
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout("mobile");
  }, [setHideHeaderOnLayout]);

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("token_list");

  const { navigate } = useRouter();

  const [tokenListType, setTokenListType] = useState<"trending" | "stocks">("trending");

  // reset token list type when chain id changes
  useEffect(() => {
    setTokenListType("trending");
  }, [chainId]);

  const [resolution, setResolution] = useState<TokenListResolution>("24h");

  const [filters, setFilters] = useState<TokenListFiltersType | undefined>();

  const [instantBuyAmount, setInstantBuyAmount] = useState<number | undefined>(0.01);

  const [instantBuyPreset, setInstantBuyPreset] = useState<number | undefined>(0);

  // container ref
  const ref = useRef<HTMLDivElement>(null);
  // get container's height
  const { height } = useResizeObserver<HTMLDivElement>({ ref });

  const handleSelectToken = useCallback(
    (token: Token) => {
      const slug = chainSlug(token.chain);
      if (slug) {
        navigate(`${AppRoute.trade}/${slug}/${token.address}`);
      }
    },
    [navigate],
  );

  return (
    <InstantBuyProvider amount={instantBuyAmount} preset={instantBuyPreset}>
      <div
        className={clsx(
          "px-4 max-sm:px-0 flex flex-col gap-2.5",
          // desktop: reserved space for toolbar
          "h-[calc(100vh-var(--header-height)-2.875rem)]",
          // tablet: reserved space for footer actions
          "max-lg:h-[calc(100vh-0.625rem-var(--footer-height)-var(--header-height))]",
          // mobile: reserved space for footer actions
          "max-sm:h-[calc(100vh-0.625rem-var(--footer-height))]",
        )}
      >
        <TokenListHeader
          type={tokenListType}
          resolution={resolution}
          filters={filters}
          onTypeChange={setTokenListType}
          onResolutionChange={setResolution}
          onFiltersChange={setFilters}
          instantBuyAmount={instantBuyAmount}
          instantBuyPreset={instantBuyPreset}
          onInstantBuyAmountChange={setInstantBuyAmount}
          onInstantBuyPresetChange={setInstantBuyPreset}
        />

        <div className="w-full min-h-0 flex-auto max-sm:px-1" ref={ref}>
          {tokenListType === "trending" && (
            <TrendingTokenListWidget
              chain={chainId as unknown as Chain}
              resolution={resolution}
              filters={filters}
              height={height}
              onSelectToken={handleSelectToken}
              ActionsComponent={InstantBuy}
            />
          )}
          {tokenListType === "stocks" && (
            <StockTokenListWidget
              chain={chainId as unknown as Chain}
              resolution={resolution}
              filters={filters}
              height={height}
              onSelectToken={handleSelectToken}
              ActionsComponent={InstantBuy}
            />
          )}
        </div>
      </div>
    </InstantBuyProvider>
  );
}

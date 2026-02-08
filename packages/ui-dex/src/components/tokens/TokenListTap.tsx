import {
  DiscoverTab,
  DiscoverSubTabs,
  // FavoriteTab,
  // FavoriteSubTabs,
  // HoldingsTab,
  // HoldingsSubTabs,
  // ViewListTab,
  // ViewListSubTabs,
  StocksTab,
  StocksSubTabs,
} from "./tabs";
import { useTokenListContext } from "./TokenListContext";
import {
  // ChainFilter,
  // ChainFilterMobile,
  TimeframeFilter,
  TimeframeFilterMobile,
  CompositeAllFiltersMobile,
} from "./filters";
import clsx from "clsx";

export function TokenListTap() {
  const { type } = useTokenListContext();

  return (
    <>
      <div
        className={clsx(
          // "w-full h-20 mt-0 lg:pt-6 z-20 bg-background text-neutral",
          "w-full h-20 lg:h-10 mt-0 z-20 bg-background text-neutral flex-none",
          "max-w-379 sm:max-w-403 mx-auto",
          "flex flex-col lg:flex-row justify-between lg:items-center lg:gap-4",
          // "sticky top-[var(--header-height)] lg:top-[calc(var(--header-height)-24px)]",
          "sticky top-[var(--header-height)]",
        )}
      >
        {/* desktop */}
        <>
          <div className="flex-1 hidden lg:flex items-center overflow-x-auto">
            {/* <FavoriteTab /> */}
            {/* <HoldingsTab /> */}
            {/* <ViewListTab /> */}
            <DiscoverTab />
            <StocksTab />
          </div>
          <div className="flex-none hidden lg:flex items-center gap-4">
            <TimeframeFilter />
            {/* <ChainFilter /> */}
          </div>
        </>

        {/* mobile */}
        <>
          <div className="lg:hidden w-full h-9 flex justify-between items-center">
            <div className="flex-1 flex items-center gap-4">
              {/* <FavoriteTab /> */}
              {/* <HoldingsTab /> */}
              {/* <ViewListTab /> */}
              <DiscoverTab />
              <StocksTab />
            </div>
            <div className="flex-none flex items-center gap-4">{/* <ChainFilterMobile /> */}</div>
          </div>
          <div className="lg:hidden w-full h-8 flex justify-between gap-4">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {/* {type === "favorite" && <FavoriteSubTabs />} */}
              {/* {type === "holdings" && <HoldingsSubTabs />} */}
              {/* {type === "views" && <ViewListSubTabs />} */}
              {type === "discover" && <DiscoverSubTabs />}
              {type === "stocks" && <StocksSubTabs />}
            </div>
            <div className="flex-none flex items-center gap-1.5">
              <TimeframeFilterMobile />
              {type === "discover" && <CompositeAllFiltersMobile />}
            </div>
          </div>
        </>
      </div>

      {/* desktop sticky header padding */}
      {/* <div className="hidden lg:block w-full h-4 bg-background sticky top-[calc(var(--header-height)+56px)] z-20"></div> */}
    </>
  );
}

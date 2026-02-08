import {
  DiscoverSubTabs,
  DiscoverTab,
  FavoriteSubTabs,
  FavoriteTab,
  // HoldingsSubTabs,
  // HoldingsTab,
  useTokenListContext,
  ViewListSubTabs,
  ViewListTab,
} from "../tokens";

export function SearchTokenListTap() {
  const { type } = useTokenListContext();

  return (
    <div className="w-full px-3 bg-background lg:bg-content2 sticky top-0 z-10">
      <div className="w-full h-9 flex items-center gap-4">
        <FavoriteTab layout="mobile" />
        {/* <HoldingsTab layout="mobile" /> */}
        <ViewListTab layout="mobile" />
        <DiscoverTab layout="mobile" />
      </div>
      <div className="w-full h-[44px] pt-3 flex items-center gap-2">
        {type === "favorite" && <FavoriteSubTabs layout="mobile" />}
        {/* {type === "holdings" && <HoldingsSubTabs layout="mobile" />} */}
        {type === "views" && <ViewListSubTabs layout="mobile" />}
        {type === "discover" && <DiscoverSubTabs layout="mobile" />}
      </div>
    </div>
  );
}

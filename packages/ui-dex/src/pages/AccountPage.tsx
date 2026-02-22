import { useState } from "react";
import { useAtom } from "jotai";
import {
  chainAtom,
  useHideHeader,
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
} from "@liberfi/ui-base";
import {
  AccountOverview,
  AccountTap,
  AssetList,
  ActivityList,
  AccountHeader,
} from "../components/account";
import { AssetTap } from "../components/account/AssetTap";

export function AccountPage() {
  // hide header on tablet & mobile
  useHideHeader("tablet");

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("account");

  const [tab, setTab] = useState<"assets" | "activities">("assets");

  const [chainId, setChainId] = useAtom(chainAtom);

  const [hideLowHoldingAssets, setHideLowHoldingAssets] = useState(false);

  return (
    <div className="w-full max-w-[860px] h-full mx-auto lg:px-6 overflow-auto">
      <AccountHeader />

      {/* 账户信息 */}
      <AccountOverview />

      {/* 列表tab切换 */}
      <AccountTap tab={tab} onTabChange={setTab}>
        {tab === "assets" && (
          <AssetTap
            chainId={chainId}
            onChainChange={setChainId}
            hideLowHoldingAssets={hideLowHoldingAssets}
            onHideLowHoldingAssetsChange={setHideLowHoldingAssets}
          />
        )}
      </AccountTap>

      {/* FIX: chrome 上边缘有 1px 漏出，无法被 sticky header 盖住 */}
      <div className="px-px">
        {/* 资产列表 */}
        {tab === "assets" && (
          <div className="lg:rounded-lg lg:bg-content1 lg:px-4 lg:pb-2.5">
            <AssetList
              chainId={chainId}
              hideLowHoldingAssets={hideLowHoldingAssets}
              classNames={{
                header:
                  "px-4 lg:px-0",
                itemWrapper: "px-2 lg:px-0",
                item: "px-2 lg:px-0",
              }}
              useWindowScroll
            />
          </div>
        )}

        {/* 交易历史 */}
        {tab === "activities" && (
          <div className="lg:rounded-lg lg:bg-content1 lg:px-4 lg:py-2.5">
            <ActivityList
              chainId={chainId}
              classNames={{ itemWrapper: "px-2 lg:px-0", item: "px-2" }}
              useWindowScroll
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { Chain } from "@liberfi/core";
import { AssetList } from "../account";

export function AccountAssetList() {
  return (
    <div className="flex-1 w-full pb-2.5 flex flex-col">
      <AssetList
        chainId={Chain.SOLANA}
        hideLowHoldingAssets={false}
        compact
        classNames={{
          header: "px-3 bg-content1 flex-none",
          itemWrapper: "px-1.5",
          item: "px-1.5 hover:bg-content2",
        }}
      />
    </div>
  );
}

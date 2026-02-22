// import { useAppContext, useTranslation } from "../../hooks";
import { useTranslation } from "@liberfi/ui-base";
import { CHAIN_ID } from "@liberfi/core";
// import { ChainSelect } from "../ChainSelect";
// import { ChainSelectMobile } from "../ChainSelectMobile";
import { Button } from "@heroui/react";
import { SelectedIndicatorIcon, UnselectedIndicatorIcon } from "../../assets";
import { useCallback } from "react";

export type AssetTapProps = {
  chainId?: CHAIN_ID | "";
  onChainChange: (chainId: CHAIN_ID) => void;
  hideLowHoldingAssets: boolean;
  onHideLowHoldingAssetsChange: (hideLowHoldingAssets: boolean) => void;
};

export function AssetTap({
  hideLowHoldingAssets,
  onHideLowHoldingAssetsChange,
}: // chainId,
// onChainChange,
AssetTapProps) {
  const { t } = useTranslation();

  // const { layout } = useAppContext();

  const handleToggleShowAllAssets = useCallback(
    () => onHideLowHoldingAssetsChange(!hideLowHoldingAssets),
    [onHideLowHoldingAssetsChange, hideLowHoldingAssets],
  );

  return (
    <div className="flex items-center gap-2.5">
      <Button
        className="flex p-0 bg-transparent text-xs text-neutral gap-1"
        startContent={
          hideLowHoldingAssets ? (
            <SelectedIndicatorIcon width={12} height={12} className="text-primary" />
          ) : (
            <UnselectedIndicatorIcon width={12} height={12} className="text-neutral" />
          )
        }
        disableRipple
        disableAnimation
        onPress={handleToggleShowAllAssets}
      >
        {t("extend.account.hide_assets")}
      </Button>

      {/* {layout === "desktop" && <ChainSelect chainId={chainId} onSelect={onChainChange} />}

      {layout !== "desktop" && (
        <ChainSelectMobile chainId={chainId} onSelect={onChainChange} />
      )} */}
    </div>
  );
}

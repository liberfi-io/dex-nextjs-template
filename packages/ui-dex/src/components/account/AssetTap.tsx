import { useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import { SelectedIndicatorIcon, UnselectedIndicatorIcon } from "../../assets";
import { useCallback } from "react";

export type AssetTapProps = {
  hideLowHoldingAssets: boolean;
  onHideLowHoldingAssetsChange: (hideLowHoldingAssets: boolean) => void;
};

export function AssetTap({
  hideLowHoldingAssets,
  onHideLowHoldingAssetsChange,
}: AssetTapProps) {
  const { t } = useTranslation();

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
    </div>
  );
}

import { useCallback } from "react";
import { useTvChartManager } from "./TvChartProvider";
import { TvChartSettingsIcon } from "@/assets";
import { Button } from "@heroui/react";
import clsx from "clsx";

export function TvChartOpenSettings({ className }: { className?: string }) {
  const chartManager = useTvChartManager();

  const handleOpenSettings = useCallback(() => {
    chartManager.internalWidget?.openSettingsDialog();
  }, [chartManager]);

  return (
    <Button
      isIconOnly
      className={clsx("w-auto min-w-0 h-6 min-h-0 px-0 bg-transparent text-neutral", className)}
      disableRipple
      onPress={handleOpenSettings}
    >
      <TvChartSettingsIcon width={24} height={24} />
    </Button>
  );
}

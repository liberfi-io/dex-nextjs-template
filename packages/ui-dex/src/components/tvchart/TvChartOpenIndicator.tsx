import { Button } from "@heroui/react";
import { useTvChartManager } from "./TvChartProvider";
import { useCallback } from "react";
import clsx from "clsx";
import { FunctionIcon } from "@/assets";

export function TvChartOpenIndicator({ className }: { className?: string }) {
  const chartManager = useTvChartManager();

  const handleOpenIndicator = useCallback(() => {
    chartManager.internalWidget?.openIndicatorSettingsDialog();
  }, [chartManager]);

  return (
    <Button
      isIconOnly
      className={clsx(
        "w-auto min-w-0 h-6 min-h-0 px-0 bg-transparent text-foreground",
        className,
      )}
      disableRipple
      onPress={handleOpenIndicator}
    >
      <FunctionIcon />
    </Button>
  );
}

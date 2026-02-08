// import screenfull from "screenfull";
import { Button } from "@heroui/react";
import { useTvChartManager } from "./TvChartProvider";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { FullScreenIcon, RestoreScreenIcon } from "@/assets";

export function TvChartFullscreen({ className }: { className?: string }) {
  const chartManager = useTvChartManager();

  const [fullscreen, setFullscreen] = useState(chartManager.fullscreen);

  const handleFullscreen = useCallback(() => {
    chartManager.fullscreen = !fullscreen;
  }, [chartManager, fullscreen]);

  useEffect(() => {
    const sub = chartManager.on("fullscreen").subscribe((fullscreen) => {
      setFullscreen(fullscreen);
    //   if (screenfull.isEnabled) {
    //     if (fullscreen) {
    //       screenfull.request();
    //     } else {
    //       screenfull.exit();
    //     }
    //   }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [chartManager]);

  return (
    <Button
      isIconOnly
      className={clsx("w-auto min-w-0 h-6 min-h-0 px-0 bg-transparent text-neutral", className)}
      disableRipple
      onPress={handleFullscreen}
    >
      {fullscreen ? <RestoreScreenIcon /> : <FullScreenIcon width={24} height={24} />}
    </Button>
  );
}

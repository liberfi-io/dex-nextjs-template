import clsx from "clsx";
import { useTranslation } from "@liberfi/ui-base";
import { ALL_TV_CHART_RESOLUTIONS, TvChartResolution } from "@/libs/tvchart";
import { memo, useCallback, useEffect, useState } from "react";
import { useTvChartContext } from "./TvChartProvider";
import { useTvChartToolbarContext } from "./TvChartToolbarProvider";
import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { ArrowDownIcon } from "@/assets";

export const TvChartResolutions = memo(() => {
  const { t } = useTranslation();

  const { chartManager } = useTvChartContext();

  const { activeAreaManager } = useTvChartToolbarContext();

  const [pinnedResolutions, setPinnedResolutions] = useState(chartManager.pinnedResolutions);

  const [resolution, setResolution] = useState<string>();

  useEffect(() => {
    const sub = chartManager.on("pinnedResolutions").subscribe((pinnedResolutions) => {
      setPinnedResolutions(pinnedResolutions);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [chartManager]);

  // TODO edit pinned resolutions
  // const handlePinnedResolutions = useCallback(
  //   (pinnedResolutions: string[]) => {
  //     chartManager.pinnedResolutions = pinnedResolutions;
  //   },
  //   [chartManager],
  // );

  const handleSelectResolution = useCallback(
    (resolution: TvChartResolution) => {
      activeAreaManager?.setResolution(resolution);
      setResolution(resolution);
    },
    [activeAreaManager],
  );

  useEffect(() => {
    if (!activeAreaManager) return;
    setResolution(activeAreaManager.resolution);
    const sub = activeAreaManager.on("resolution").subscribe(() => {
      setResolution(activeAreaManager.resolution);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [activeAreaManager]);

  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const handleSelectResolutionInPopover = useCallback(
    (resolution: TvChartResolution) => {
      handleSelectResolution(resolution);
      onClose();
    },
    [handleSelectResolution, onClose],
  );

  return (
    <div className="flex items-center gap-0 text-xs text-neutral">
      <div className="mr-2 font-medium max-sm:hidden">{t("extend.trade.tvchart.timeframe")}</div>
      {pinnedResolutions.map((it, index) => (
        <div
          key={it}
          className={clsx(
            "h-6 flex items-center justify-center rounded-full px-2.5 cursor-pointer hover:opacity-80",
            "data-[active=true]:bg-content2 data-[active=true]:font-bold data-[active=true]:text-white",
            index > 2 && "max-sm:hidden",
          )}
          data-active={it === resolution}
          onClick={() => handleSelectResolution(it)}
        >
          {it}
        </div>
      ))}
      <Popover
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="bottom"
        classNames={{ content: "w-48 bg-content2 rounded-lg px-4 py-2.5" }}
      >
        <PopoverTrigger>
          <Button
            isIconOnly
            className="w-auto min-w-0 h-6 min-h-0 px-2.5 bg-transparent text-neutral"
            disableRipple
          >
            <ArrowDownIcon width={12} height={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="w-full gap-y-2 flex items-center flex-wrap text-xs text-neutral">
            {ALL_TV_CHART_RESOLUTIONS.map((it) => (
              <div
                key={it}
                className={clsx(
                  "w-10 h-6 flex items-center justify-center rounded-full cursor-pointer hover:opacity-80 text-center",
                  "data-[active=true]:bg-content3 data-[active=true]:font-bold data-[active=true]:text-white",
                )}
                data-active={it === resolution}
                onClick={() => handleSelectResolutionInPopover(it)}
              >
                {it}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

import { memo } from "react";
import { TvChartResolutions } from "./TvChartResolutions";
import { TvChartToolbarProvider } from "./TvChartToolbarProvider";
import { Divider } from "@heroui/react";
import { TvChartKlineStyleSelect } from "./TvChartKlineStyleSelect";
import { TvChartOpenIndicator } from "./TvChartOpenIndicator";
import { TvChartSnapshot } from "./TvChartSnapshot";
import { TvChartOpenSettings } from "./TvChartOpenSettings";
import { TvChartFullscreen } from "./TvChartFullscreen";
import { TvChartMulticharts } from "./TvChartMulticharts";
import { TvChartPriceTypeSwitch } from "./TvChartPriceTypeSwitch";
import { TvChartQuoteTypeSwitch } from "./TvChartQuoteTypeSwitch";

export const TvChartToolbar = memo(() => {
  return (
    <TvChartToolbarProvider>
      <div className="flex-none h-9 px-4 w-full flex bg-content1">
        <div className="flex-1 flex justify-start items-center gap-2.5">
          <TvChartResolutions />
          <Divider orientation="vertical" className="max-sm:hidden h-4 border-content3" />
          <TvChartMulticharts className="max-sm:hidden" />
          <Divider orientation="vertical" className="max-sm:hidden h-4 border-content3" />
          <TvChartKlineStyleSelect className="max-sm:hidden" />
          <TvChartOpenIndicator className="max-sm:hidden" />
          <Divider orientation="vertical" className="max-sm:hidden h-4 border-content3" />
          <TvChartPriceTypeSwitch className="max-sm:hidden" />
          <Divider orientation="vertical" className="max-sm:hidden h-4 border-content3" />
          <TvChartQuoteTypeSwitch className="max-sm:hidden" />
        </div>
        <div className="flex-none flex justify-end items-center gap-2.5">
          <TvChartPriceTypeSwitch className="sm:hidden" />
          <TvChartKlineStyleSelect className="sm:hidden" />
          <TvChartOpenIndicator className="sm:hidden" />
          <TvChartSnapshot className="max-sm:hidden" />
          <TvChartFullscreen className="max-sm:hidden" />
          <TvChartOpenSettings className="max-sm:hidden" />
        </div>
      </div>
    </TvChartToolbarProvider>
  );
});

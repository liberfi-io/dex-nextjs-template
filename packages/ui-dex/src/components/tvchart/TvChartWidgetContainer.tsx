import { TvChartLibraryWidget } from "@/libs/tvchart";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TvChartLibraryWidgetBridge } from "@/libs/tvchart/TvChartLibraryWidgetBridge";
import { useTvChartContext } from "./TvChartProvider";
import { TvChartLayout } from "./TvChartLayout";

export interface TvChartWidgetContainerProps {
  onReady?: () => void;
}

export const TvChartWidgetContainer = forwardRef<
  TvChartLibraryWidget | undefined,
  TvChartWidgetContainerProps
>(({ onReady }, ref) => {
  const { chartManager, chartSettings } = useTvChartContext();

  const onReadyRef = useRef(onReady);

  const [_bridge, setBridge] = useState<TvChartLibraryWidgetBridge>();

  const [widget, setWidget] = useState<TvChartLibraryWidget>();

  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

  const [ready, setReady] = useState(false);

  // const [error, setError] = useState<Error>();

  useEffect(() => {
    if (ready && onReadyRef.current) {
      setTimeout(onReadyRef.current);
    }
  }, [ready]);

  useImperativeHandle(ref, () => widget, [widget]);

  useEffect(() => {
    if (containerElement) {
      const bridge = new TvChartLibraryWidgetBridge(chartSettings, chartManager);
      const widget = new TvChartLibraryWidget(chartSettings, chartManager, bridge);

      setBridge(bridge);
      setWidget(widget);

      bridge
        .init(containerElement)
        .then(() => {
          setReady(true);
        })
        .catch((error) => {
          console.error("TvChartWidgetContainer: failed to init bridge", error);
          // setError(error);
        });

      return () => {
        bridge
          .destroy()
          .then(() => {
            setBridge(undefined);
            setWidget(undefined);
            setReady(false);
          })
          .catch(() => {
            console.error("TvChartWidgetContainer: failed to destroy bridge");
          });
      };
    }
  }, [containerElement, chartSettings, chartManager]);

  // TODO set notificationManager handle
  // useEffect(() => {
  //   if (bridge) {
  //     bridge.notificationManager.setHandle(handle);
  //   }
  // }, [bridge, handle]);

  return (
    <div className="w-full h-full">
      <TvChartLayout />
      <div id="tv_chart_container" className="w-full h-full" ref={setContainerElement}></div>
    </div>
  );
});

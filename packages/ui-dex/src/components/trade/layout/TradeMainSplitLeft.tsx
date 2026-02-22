import { PropsWithChildren, useCallback } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { Button } from "@heroui/react";
import { HideSidePanelIcon } from "../../../assets";
import { hideTradeLeftPanelAtom } from "../../../states";

export type TradeMainSplitLeftProps = PropsWithChildren<{
  sideContent?: React.ReactNode;
}>;

export function TradeMainSplitLeft({ sideContent, children }: TradeMainSplitLeftProps) {
  const [hideLeftPanel, setHideLeftPanel] = useAtom(hideTradeLeftPanelAtom);

  const toggleHideLeftPanel = useCallback(() => {
    setHideLeftPanel((prev) => !prev);
  }, [setHideLeftPanel]);

  return (
    <div className="relative w-full md:h-full flex flex-col md:flex-row gap-1 md:overflow-hidden">
      <div
        className={clsx(
          "relative md:flex-none w-full md:w-[300px] md:data-[hide=true]:w-0 md:h-full order-2 md:order-1 flex flex-col gap-1 md:overflow-hidden",
          "transition-[width] duration-200 ease-in-out",
        )}
        data-hide={hideLeftPanel}
      >
        {sideContent}

        <Button
          isIconOnly
          className="flex z-10 w-[22px] min-w-[22px] h-[20px] min-h-[20px] absolute right-0 top-4 max-md:hidden bg-transparent rounded-none"
          disableRipple
          onPress={toggleHideLeftPanel}
        >
          <HideSidePanelIcon />
        </Button>
      </div>
      <div className="md:flex-1 max-md:w-full md:h-full order-1 md:order-2 flex flex-col gap-1 md:overflow-hidden">
        {children}
      </div>
    </div>
  );
}

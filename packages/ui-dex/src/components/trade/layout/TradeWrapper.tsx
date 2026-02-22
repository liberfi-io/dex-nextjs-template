import { PropsWithChildren, useCallback } from "react";
import { useAtom } from "jotai";
import { clsx } from "clsx";
import { Button } from "@heroui/react";
import { hideTradeLeftPanelAtom } from "../../../states";
import { OpenSidePanelIcon } from "../../../assets";

export function TradeWrapper({ children }: PropsWithChildren) {
  const [hideLeftPanel, setHideLeftPanel] = useAtom(hideTradeLeftPanelAtom);

  const toggleHideLeftPanel = useCallback(() => {
    setHideLeftPanel((prev) => !prev);
  }, [setHideLeftPanel]);

  return (
    <div
      className={clsx(
        "relative w-full flex flex-col",
        // mobile: auto height & page scrollable & reserved space for footer actions
        "max-md:pb-[calc(var(--footer-height))]",
        // tablet: header is hidden & page non-scrollable
        "md:h-[calc(100vh-0.625rem)] md:overflow-hidden md:px-5",
        // desktop: header is shown & page non-scrollable
        "lg:h-[calc(100vh-var(--header-height)-2.875rem)]",
      )}
    >
      {children}

      {hideLeftPanel && (
        <Button
          isIconOnly
          className={clsx(
            "flex w-[19px] min-w-[19px] h-[26px] min-h-[26px] bg-transparent rounded-none max-md:hidden",
            "absolute left-0 top-[calc(var(--header-height)+120px)] lg:top-[120px]",
          )}
          onPress={toggleHideLeftPanel}
        >
          <OpenSidePanelIcon />
        </Button>
      )}
    </div>
  );
}

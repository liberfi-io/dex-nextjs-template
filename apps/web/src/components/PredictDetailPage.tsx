"use client";

import { clsx } from "@liberfi.io/ui";
import {
  hideHeaderOnLayoutAtom,
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
} from "@liberfi/ui-base";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { EventDetailPage } from "@liberfi.io/ui-predict";

export function PredictDetailPage({ id }: { id: string }) {
  // hide header on mobile
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout("mobile");
  }, [setHideHeaderOnLayout]);

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("predict");

  return (
    <div
      className={clsx(
        "px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto",
        // desktop: reserved space for toolbar
        "h-[calc(100vh-var(--header-height)-2.875rem)]",
        // tablet: reserved space for footer actions
        "max-lg:h-[calc(100vh-0.625rem-var(--footer-height)-var(--header-height))]",
        // mobile: reserved space for footer actions
        "max-sm:h-[calc(100vh-0.625rem-var(--footer-height))]",
      )}
    >
      <div className="p-2 sm:p-4 flex w-full max-w-[1550px] mx-auto">
        <EventDetailPage eventId={id} />
      </div>
    </div>
  );
}

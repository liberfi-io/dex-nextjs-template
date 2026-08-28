"use client";

import { RedPacketHistoriesPage as RedPacketHistoriesPageWidget } from "@liberfi.io/ui-redpacket";
import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";

export function RedPacketHistoriesPage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();
  return <RedPacketHistoriesPageWidget />;
}

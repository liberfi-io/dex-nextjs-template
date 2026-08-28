"use client";

import { RedPacketHomePage as RedPacketHomePageWidget } from "@liberfi.io/ui-redpacket";
import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";

export function RedPacketHomePage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();
  return <RedPacketHomePageWidget />;
}

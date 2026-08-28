"use client";

import { RedPacketHomePage as RedPacketHomePageWidget } from "@liberfi.io/ui-redpacket";
import { useHideBottomNavigationBar, useHideHeader } from "../../application/layout-chrome";

export function RedPacketHomePage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();
  return <RedPacketHomePageWidget />;
}

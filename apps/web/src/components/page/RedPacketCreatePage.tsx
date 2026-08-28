"use client";

import { RedPacketCreatePage as RedPacketCreatePageWidget } from "@liberfi.io/ui-redpacket";
import { useHideBottomNavigationBar, useHideHeader } from "../../application/layout-chrome";

export function RedPacketCreatePage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();
  return <RedPacketCreatePageWidget />;
}

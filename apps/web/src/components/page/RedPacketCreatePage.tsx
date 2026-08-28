"use client";

import { RedPacketCreatePage as RedPacketCreatePageWidget } from "@liberfi.io/ui-redpacket";
import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";

export function RedPacketCreatePage() {
  useHideHeader("tablet");
  useHideBottomNavigationBar();
  return <RedPacketCreatePageWidget />;
}

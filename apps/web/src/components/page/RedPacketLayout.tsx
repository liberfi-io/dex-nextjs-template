"use client";

import { PropsWithChildren } from "react";
import { useSearchParams } from "next/navigation";
import {
  ClaimRedPacketModal,
  RedPacketClaimsModal,
  RedPacketModal,
  RedPacketProvider,
  ShareRedPacketModal,
} from "@liberfi.io/ui-redpacket";
import { RedpacketUiBridge } from "../../runtime/Stage55UiBridge";

export function RedPacketLayout({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();

  return (
    <RedpacketUiBridge>
      <RedPacketProvider shareId={searchParams.get("share") ?? undefined}>
        {children}
        <ClaimRedPacketModal />
        <ShareRedPacketModal />
        <RedPacketModal />
        <RedPacketClaimsModal />
      </RedPacketProvider>
    </RedpacketUiBridge>
  );
}

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
import { asJsx } from "../../application/jsx";
import { RedpacketUiBridge } from "../../runtime/Stage55UiBridge";

const PacketProvider = asJsx<PropsWithChildren<{ shareId?: string }>>(RedPacketProvider);

export function RedPacketLayout({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();

  return (
    <RedpacketUiBridge>
      <PacketProvider shareId={searchParams.get("share") ?? undefined}>
        {children}
        <ClaimRedPacketModal />
        <ShareRedPacketModal />
        <RedPacketModal />
        <RedPacketClaimsModal />
      </PacketProvider>
    </RedpacketUiBridge>
  );
}

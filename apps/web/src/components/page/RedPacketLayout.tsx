"use client";

import { PropsWithChildren } from "react";
import { useSearchParams } from "next/navigation";
import {
  ClaimRedPacketModal,
  RedPacketClaimsModal,
  RedPacketModal,
  RedPacketProvider,
  ShareRedPacketModal,
} from "@liberfi/ui-redpacket";

export function RedPacketLayout({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();

  return (
    <RedPacketProvider shareId={searchParams.get("share") ?? undefined}>
      {children}
      <ClaimRedPacketModal />
      <ShareRedPacketModal />
      <RedPacketModal />
      <RedPacketClaimsModal />
    </RedPacketProvider>
  );
}

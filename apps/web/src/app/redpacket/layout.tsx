"use client";

import { PropsWithChildren } from "react";
import {
  ClaimRedPacketModal,
  RedPacketClaimsModal,
  RedPacketModal,
  RedPacketProvider,
  ShareRedPacketModal,
} from "@liberfi/ui-redpacket";
import { useSearchParams } from "next/navigation";

export default function Layout({ children }: PropsWithChildren) {
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

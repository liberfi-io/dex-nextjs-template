"use client";

import { cn } from "@liberfi.io/ui";
import {
  Channel,
  ChannelEditButton,
  ChannelsHomePage,
  ChannelSubscribeButton,
} from "@liberfi.io/ui-channels";
import { hideHeaderOnLayoutAtom, useSetBottomNavigationBarActiveKey, useShowBottomNavigationBar } from "@liberfi/ui-base";
import { useChainAwareRouter } from "../hooks/useChainAwareRouter";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export function ChannelsPage() {
  const router = useChainAwareRouter();

  // hide header on mobile
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout("mobile");
  }, [setHideHeaderOnLayout]);

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("channels");

  return (
    <div
      className={cn(
        "px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto",
        // desktop: reserved space for toolbar
        "h-[calc(100vh-var(--header-height)-2.875rem)]",
        // tablet: reserved space for footer actions
        "max-lg:h-[calc(100vh-0.625rem-var(--footer-height)-var(--header-height))]",
        // mobile: reserved space for footer actions
        "max-sm:h-[calc(100vh-0.625rem-var(--footer-height))]",
      )}
    >
      <ChannelsHomePage
        onCreateChannel={() => {
          router.push("/channels/create");
        }}
        onSelectChannel={(channel) => {
          router.push(`/channels/${channel.id}`);
        }}
        customHeaderActions={(channel) => <HeaderActions channel={channel} />}
        customFooterActions={(channel) => <FooterActions channel={channel} />}
      />
    </div>
  );
}

function HeaderActions({ channel }: { channel: Channel }) {
  const router = useChainAwareRouter();
  return (
    <div className="flex items-center gap-2">
      <ChannelEditButton
        channel={channel}
        onEdit={() => {
          router.push(`/channels/${channel.id}/update`);
        }}
      />
    </div>
  );
}

function FooterActions({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center gap-2">
      <ChannelSubscribeButton channel={channel} />
    </div>
  );
}

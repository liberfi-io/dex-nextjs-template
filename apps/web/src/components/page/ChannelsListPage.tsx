"use client";

import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import {
  ChannelEditButton,
  ChannelsHomePage,
  ChannelSubscribeButton,
} from "@liberfi.io/ui-channels";
import { Channel } from "@liberfi.io/ui-channels";

export function ChannelsListPage() {
  const router = useRouter();

  return (
    <div className={cn("relative w-full h-full")}>
      {/* Ambient header glow */}
      <div className="relative overflow-hidden border-b border-border-subtle">
        <div className="dot-grid" />
        <div className="relative z-[1] px-4 sm:px-6 pt-6 pb-4 sm:pt-8 sm:pb-5 max-w-[1680px] mx-auto">
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
          >
            Channels
          </h1>
        </div>
      </div>
      <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar")}>
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
    </div>
  );
}

function HeaderActions({ channel }: { channel: Channel }) {
  const router = useRouter();
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

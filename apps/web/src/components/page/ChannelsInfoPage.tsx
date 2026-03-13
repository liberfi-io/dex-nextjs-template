"use client";

import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import {
  ChannelEditButton,
  ChannelsDetailPage,
  ChannelSubscribeButton,
} from "@liberfi.io/ui-channels";
import { Channel } from "@liberfi.io/ui-channels";

export function ChannelsInfoPage({ id }: { id: string }) {
  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="w-full h-full max-w-2xl mx-auto overflow-y-auto">
        <ChannelsDetailPage
          id={id}
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

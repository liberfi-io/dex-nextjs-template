"use client";

import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import { CreateChannelWidget } from "@liberfi.io/ui-channels";
import { useTranslation } from "@liberfi.io/i18n";

export function ChannelsCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="w-full max-w-3xl h-full overflow-y-auto mx-auto px-2 sm:px-4 py-4">
        <h1 className="text-base sm:text-lg font-semibold mb-4">{t("channels.create.title")}</h1>
        <CreateChannelWidget
          onSuccess={(channel) => {
            router.push(`/channels/${channel.id}/update?type=wallets`);
          }}
        />
      </div>
    </div>
  );
}

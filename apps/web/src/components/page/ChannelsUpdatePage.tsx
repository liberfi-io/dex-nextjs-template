"use client";

import { cn } from "@liberfi.io/ui";
import { UpdateChannelFormType, UpdateChannelWidget } from "@liberfi.io/ui-channels";
import { useTranslation } from "@liberfi.io/i18n";

export function ChannelsUpdatePage({ id, type }: { id: string; type: string }) {
  const { t } = useTranslation();

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="w-full max-w-xl h-full overflow-y-auto mx-auto px-2 sm:px-4 py-4">
        <h1 className="text-base sm:text-lg font-semibold mb-4">{t("channels.update.title")}</h1>
        <UpdateChannelWidget id={id} type={type as UpdateChannelFormType} />
      </div>
    </div>
  );
}

"use client";

import { clsx } from "@liberfi.io/ui";
import { CreateChannelWidget } from "@liberfi.io/ui-channels";
import { hideHeaderOnLayoutAtom, useRouter, useSetBottomNavigationBarActiveKey, useShowBottomNavigationBar, useTranslation } from "@liberfi/ui-base";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export function ChannelsCreatePage() {
  const { t } = useTranslation();

  const { navigate } = useRouter();

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
      className={clsx(
        "px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto",
        // desktop: reserved space for toolbar
        "h-[calc(100vh-var(--header-height)-2.875rem)]",
        // tablet: reserved space for footer actions
        "max-lg:h-[calc(100vh-0.625rem-var(--footer-height)-var(--header-height))]",
        // mobile: reserved space for footer actions
        "max-sm:h-[calc(100vh-0.625rem-var(--footer-height))]",
      )}
    >
      <div className="w-full max-w-3xl h-full overflow-y-auto mx-auto px-2 sm:px-4 py-4">
        <h1 className="text-base sm:text-lg font-semibold mb-4">{t("channels.create.title")}</h1>
        <CreateChannelWidget
          onSuccess={(channel) => {
            navigate(`/channels/${channel.id}/update?type=wallets`);
          }}
        />
      </div>
    </div>
  );
}

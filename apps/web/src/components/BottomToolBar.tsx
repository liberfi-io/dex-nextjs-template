"use client";

import { useAppSdk, UserGuideIcon, useTranslation, RobotIcon } from "@liberfi/ui-base";
import { tradeBuyPresetAtom } from "@liberfi/ui-dex";
import { useAtomValue } from "jotai";
import {
  DiscordIcon,
  Divider,
  SettingsIcon,
  StyledButton,
  StyledTooltip,
  TwitterIcon,
} from "@liberfi.io/ui";
import { useDraggableDisclosure } from "@liberfi.io/ui-scaffold";
import { useCallback } from "react";
import { BottomToolBarWallet } from "./BottomToolBarWallet";
import { BottomNetworkStatus } from "./BottomNetworkStatus";
import { BottomSolPrice } from "./BottomSolPrice";

export function BottomToolBar() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const preset = useAtomValue(tradeBuyPresetAtom);

  const handlePresetSettings = useCallback(() => {
    appSdk.events.emit("trade_settings:open", { preset });
  }, [appSdk, preset]);

  const { onOpen: onOpenMediaTrack } = useDraggableDisclosure("mediaTrack");

  const { onOpen: onOpenAICopilot } = useDraggableDisclosure("aiCopilot");

  return (
    <div className="max-lg:hidden w-full h-full border-t border-border bg-background px-6 flex items-center justify-between gap-4">
      <div className="flex items-center justify-start gap-4">
        {/* preset */}
        <StyledButton
          size="sm"
          className="px-2 h-6 min-h-0 gap-1 bg-primary/20 text-primary"
          startContent={<SettingsIcon width={16} height={16} />}
          onPress={handlePresetSettings}
        >
          {t(`extend.trade.settings.preset${preset + 1}`)}
        </StyledButton>

        {/* wallet */}
        <BottomToolBarWallet />

        <Divider orientation="vertical" className="h-6 bg-content3" />

        <StyledTooltip content={t("extend.toolbar.media_track_tooltip")} closeDelay={0}>
          <StyledButton
            size="sm"
            className="relative h-6 min-h-0 px-1 gap-1 bg-transparent hover:bg-content1 text-neutral text-xs overflow-visible"
            startContent={<TwitterIcon width={16} height={16} className="text-neutral" />}
            onPress={onOpenMediaTrack}
          >
            {t("extend.toolbar.media_track")}
            <div className="w-2 h-2 rounded-full bg-danger absolute top-0 right-0 translate-x-px -translate-y-px" />
          </StyledButton>
        </StyledTooltip>

        <StyledTooltip content={t("extend.toolbar.ai_copilot_tooltip")} closeDelay={0}>
          <StyledButton
            size="sm"
            className="relative h-6 min-h-0 px-2 gap-1 bg-transparent hover:bg-content1 text-neutral text-xs overflow-visible"
            startContent={<RobotIcon width={18} height={18} className="text-neutral" />}
            onPress={onOpenAICopilot}
          >
            {t("extend.toolbar.ai_copilot")}
            <div className="w-2 h-2 rounded-full bg-danger absolute top-0 right-0 translate-x-px -translate-y-px" />
          </StyledButton>
        </StyledTooltip>

        <Divider orientation="vertical" className="h-6 bg-content3" />
        <BottomSolPrice />
      </div>
      <div className="flex items-center justify-end gap-4">
        <BottomNetworkStatus />
        <Divider orientation="vertical" className="h-6 bg-content3" />
        <StyledTooltip content={t("extend.toolbar.discord")} closeDelay={0}>
          <StyledButton
            isIconOnly
            className="w-5 h-5 min-w-5 min-h-5 bg-transparent"
            onPress={() => window.open("https://discord.gg/TxB2bXcsnE", "_blank")}
          >
            <DiscordIcon
              width={18}
              height={18}
              className="text-neutral hover:opacity-80 cursor-pointer"
            />
          </StyledButton>
        </StyledTooltip>
        <StyledTooltip content={t("extend.toolbar.twitter")} closeDelay={0}>
          <StyledButton
            isIconOnly
            className="w-5 h-5 min-w-5 min-h-5 bg-transparent"
            onPress={() => window.open("https://x.com/liberfi_io", "_blank")}
          >
            <TwitterIcon
              width={18}
              height={18}
              className="text-neutral hover:opacity-80 cursor-pointer"
            />
          </StyledButton>
        </StyledTooltip>
        <StyledTooltip content={t("extend.toolbar.docs")} closeDelay={0}>
          <UserGuideIcon
            width={18}
            height={18}
            className="text-neutral hover:opacity-80 cursor-pointer"
          />
        </StyledTooltip>
      </div>
    </div>
  );
}

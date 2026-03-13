"use client";

import { useAppSdk, UserGuideIcon, useTranslation, RobotIcon } from "@liberfi/ui-base";
import { tradeBuyPresetAtom } from "@liberfi/ui-dex";
import { useAtomValue } from "jotai";
import {
  DiscordIcon,
  Divider,
  SettingsIcon,
  Button,
  StyledTooltip,
  TwitterIcon,
} from "@liberfi.io/ui";
import { ScaffoldToolbar, useAsyncModal, useDraggableDisclosure } from "@liberfi.io/ui-scaffold";
import { useCallback, useMemo } from "react";
import { BottomToolBarWallet } from "./BottomToolBarWallet";
import { BottomNetworkStatus } from "./BottomNetworkStatus";
import { BottomSolPrice } from "./BottomSolPrice";
import { PresetFormModalParams, useInstantTradeAmount } from "@liberfi.io/ui-trade";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { getNativeToken } from "@liberfi.io/utils";
import { Chain } from "@liberfi.io/types";

/**
 * Bottom toolbar content for the new Scaffold layout.
 * Uses ScaffoldToolbar from @liberfi.io/ui-scaffold; typically shown on desktop
 * (toolbarVisible: ["desktop"]) while ScaffoldFooter is shown on mobile.
 */
export function AppBottomToolbar() {
  const { t } = useTranslation();

  const { chain } = useCurrentChain();

  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);

  const { preset } = useInstantTradeAmount({
    id: "token-list",
    chain: chain,
    tokenAddress: nativeToken?.address ?? "",
  });

  const { onOpen: openPresetModal } = useAsyncModal<PresetFormModalParams>("preset");

  const handlePresetClick = useCallback(() => {
    openPresetModal({
      params: {
        chains: [Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE],
        defaultChain: chain,
        defaultDirection: "buy",
        defaultPresetIndex: preset,
      },
    });
  }, [openPresetModal, chain, preset]);

  const { onOpen: onOpenMediaTrack } = useDraggableDisclosure("mediaTrack");
  const { onOpen: onOpenAICopilot } = useDraggableDisclosure("aiCopilot");

  const left = (
    <div className="flex items-center justify-start gap-4">
      <Button
        size="sm"
        className="px-2 h-6 min-h-0 gap-1 bg-primary/20 text-primary"
        startContent={<SettingsIcon width={16} height={16} />}
        onPress={handlePresetClick}
      >
        {t(`extend.trade.settings.preset${preset + 1}`)}
      </Button>

      <BottomToolBarWallet />

      <Divider orientation="vertical" className="h-6 bg-content3" />

      <StyledTooltip content={t("extend.toolbar.media_track_tooltip")}>
        <Button
          size="sm"
          className="relative h-6 min-h-0 px-1 gap-1 bg-transparent hover:bg-content1 text-neutral text-xs overflow-visible"
          startContent={<TwitterIcon width={16} height={16} className="text-neutral" />}
          onPress={onOpenMediaTrack}
        >
          {t("extend.toolbar.media_track")}
          <div className="w-2 h-2 rounded-full bg-danger absolute top-0 right-0 translate-x-px -translate-y-px" />
        </Button>
      </StyledTooltip>

      <StyledTooltip content={t("extend.toolbar.ai_copilot_tooltip")} closeDelay={0}>
        <Button
          size="sm"
          className="relative h-6 min-h-0 px-2 gap-1 bg-transparent hover:bg-content1 text-neutral text-xs overflow-visible"
          startContent={<RobotIcon width={18} height={18} className="text-neutral" />}
          onPress={onOpenAICopilot}
        >
          {t("extend.toolbar.ai_copilot")}
          <div className="w-2 h-2 rounded-full bg-danger absolute top-0 right-0 translate-x-px -translate-y-px" />
        </Button>
      </StyledTooltip>

      <Divider orientation="vertical" className="h-6 bg-content3" />
      <BottomSolPrice />
    </div>
  );

  const right = (
    <div className="flex items-center justify-end gap-4">
      <BottomNetworkStatus />
      <Divider orientation="vertical" className="h-6 bg-content3" />
      <StyledTooltip content={t("extend.toolbar.discord")} closeDelay={0}>
        <Button
          isIconOnly
          className="w-5 h-5 min-w-5 min-h-5 bg-transparent"
          onPress={() => window.open("https://discord.gg/TxB2bXcsnE", "_blank")}
        >
          <DiscordIcon
            width={18}
            height={18}
            className="text-neutral hover:opacity-80 cursor-pointer"
          />
        </Button>
      </StyledTooltip>
      <StyledTooltip content={t("extend.toolbar.twitter")} closeDelay={0}>
        <Button
          isIconOnly
          className="w-5 h-5 min-w-5 min-h-5 bg-transparent"
          onPress={() => window.open("https://x.com/liberfi_io", "_blank")}
        >
          <TwitterIcon
            width={18}
            height={18}
            className="text-neutral hover:opacity-80 cursor-pointer"
          />
        </Button>
      </StyledTooltip>
      <StyledTooltip content={t("extend.toolbar.docs")} closeDelay={0}>
        <UserGuideIcon
          width={18}
          height={18}
          className="text-neutral hover:opacity-80 cursor-pointer"
        />
      </StyledTooltip>
    </div>
  );

  return <ScaffoldToolbar left={left} right={right} />;
}

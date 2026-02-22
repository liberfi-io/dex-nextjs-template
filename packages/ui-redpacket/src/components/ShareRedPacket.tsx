"use client";

import { RedPacketIcon } from "../icons";
import { RedPacketDTO } from "@chainstream-io/sdk";
import { Button, Link, Skeleton } from "@heroui/react";
import { CONFIG, ROUTES } from "@liberfi/core";
import { txExplorerUrl } from "@liberfi.io/utils";
import { useTokenQuery } from "@liberfi/react-dex";
import { useRedPacketQuery } from "@liberfi/react-redpacket";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  ExternalLinkOutlinedIcon,
  useAppSdk,
  useCopyToClipboard,
  useTranslation,
} from "@liberfi/ui-base";
import { TelegramIcon, TwitterIcon } from "@liberfi/ui-dex/assets/icons";
import { TokenAvatar } from "@liberfi/ui-dex/components/TokenAvatar";
import { BigNumber } from "bignumber.js";
import { useCallback, useMemo } from "react";

export type ShareRedPacketProps = {
  redPacket?: RedPacketDTO;
  redPacketId: string;
};

export function ShareRedPacket({
  redPacket: placeholderRedPacket,
  redPacketId,
}: ShareRedPacketProps) {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const { chain } = useCurrentChain();

  const copy = useCopyToClipboard();

  const { data: latestRedPacket } = useRedPacketQuery(redPacketId);

  const redPacket = useMemo(
    () => latestRedPacket ?? placeholderRedPacket,
    [latestRedPacket, placeholderRedPacket],
  );

  const { data: token, isLoading: isLoadingToken } = useTokenQuery(chain, redPacket?.mint ?? "", {
    enabled: !!redPacket?.mint,
  });

  const totalAmount = useMemo(
    () => new BigNumber(redPacket?.totalAmount ?? 0).shiftedBy(-(token?.decimals ?? 0)).toString(),
    [redPacket?.totalAmount, token?.decimals],
  );

  const shareURL = useMemo(
    () =>
      window.location.protocol +
      "//" +
      window.location.host +
      ROUTES.redPacket.home(redPacket?.shareId),
    [redPacket?.shareId],
  );

  const handleCopyClaimCode = useCallback(
    () => copy(redPacket?.shareId ?? ""),
    [redPacket?.shareId, copy],
  );

  const handleCopyClaimURL = useCallback(() => copy(shareURL), [shareURL, copy]);

  const handleShareToTelegram = useCallback(() => {
    appSdk.openPage(
      `https://t.me/share?url=${encodeURIComponent(shareURL)}&text=${encodeURIComponent(
        t("extend.redpacket.share.share_telegram_text", { hashtag: CONFIG.branding.name }),
      )}`,
      {
        target: "_blank",
      },
    );
  }, [shareURL, appSdk, t]);

  const handleShareToTwitter = useCallback(() => {
    appSdk.openPage(
      `https://x.com/intent/post?text=${encodeURIComponent(
        t("extend.redpacket.share.share_twitter_text", {
          url: shareURL,
          hashtag: CONFIG.branding.name,
        }),
      )}`,
      {
        target: "_blank",
      },
    );
  }, [shareURL, appSdk, t]);

  if (!redPacket || isLoadingToken || !token) {
    return <Skeletons />;
  }

  return (
    <div className="w-full flex flex-col p-6 items-center">
      {/* title */}
      <h2 className="text-lg font-bold">{t("extend.redpacket.share.title")}</h2>

      {/* animation */}
      <RedPacketIcon width={64} height={64} className="mt-4" />

      {/* red packet info */}
      <div className="mt-4 flex justify-center items-center gap-8">
        <div className="flex items-center gap-2">
          <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol} size={24} />
          <p className="text-lg font-bold">{totalAmount}</p>
          <p className="text-lg font-bold text-neutral">{token?.symbol}</p>
        </div>
        <p className="text-lg text-neutral">
          {redPacket.maxClaims > 1
            ? t("extend.redpacket.info.n_red_packets", { count: redPacket.maxClaims })
            : t("extend.redpacket.info.1_red_packet", { count: redPacket.maxClaims })}
        </p>
      </div>

      {/* message */}
      <p className="mt-4 text-xs text-neutral text-center font-medium">
        {t("extend.redpacket.share.message")}
      </p>

      {/* share buttons */}
      <Button
        className="mt-4 rounded-lg"
        fullWidth
        color="primary"
        disableRipple
        onPress={handleCopyClaimCode}
      >
        {t("extend.redpacket.share.copy_claim_code")}
      </Button>

      <Button
        className="mt-4 rounded-lg"
        fullWidth
        color="secondary"
        disableRipple
        onPress={handleCopyClaimURL}
      >
        {t("extend.redpacket.share.copy_claim_url")}
      </Button>

      {/* share to socials */}
      <div className="mt-4 flex justify-center items-center gap-4">
        {/* telegram */}
        <Button
          className="bg-transparent w-6 min-w-0 h-6 min-h-0"
          isIconOnly
          disableRipple
          onPress={handleShareToTelegram}
        >
          <TelegramIcon width={18} height={18} />
        </Button>
        {/* twitter */}
        <Button
          className="bg-transparent w-6 min-w-0 h-6 min-h-0"
          isIconOnly
          disableRipple
          onPress={handleShareToTwitter}
        >
          <TwitterIcon width={18} height={18} />
        </Button>
      </div>

      {/* view on explorer */}
      <Button
        as={Link}
        href={txExplorerUrl(chain, redPacket.txHash)}
        target="_blank"
        className="mt-2 bg-transparent text-xs text-neutral"
        endContent={<ExternalLinkOutlinedIcon width={12} height={12} className="text-neutral" />}
        disableRipple
      >
        {t("extend.redpacket.info.view_on_explorer")}
      </Button>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="w-full flex flex-col p-6 items-center">
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
    </div>
  );
}

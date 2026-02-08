import { PropsWithChildren, useCallback, useMemo } from "react";
import { RedPacketDTO } from "@chainstream-io/sdk";
import { useRedPacketQuery } from "@liberfi/react-redpacket";
import {
  BackwardOutlinedIcon,
  chainAtom,
  ExternalLinkOutlinedIcon,
  ForwardOutlinedIcon,
  useAppSdk,
  useTranslation,
} from "@liberfi/ui-base";
import { Button, Link, Skeleton } from "@heroui/react";
import { RedPacketIcon, RedPacketMemoIcon } from "@/icons";
import { formatShortAddress } from "@liberfi/ui-dex/dist/libs/format";
import { useTokenQuery } from "@liberfi/react-dex";
import { useAtomValue } from "jotai";
import { TokenAvatar } from "@liberfi/ui-dex/dist/components/TokenAvatar";
import { BigNumber } from "bignumber.js";
import { chainTxExplorer } from "@liberfi/core";
import { getRedPacketStatus } from "@/utils";

export type RedPacketProps = {
  perspective: "received" | "sent";
  redPacket?: RedPacketDTO;
  redPacketId: string;
  onNavigateBack?: () => void;
};

export function RedPacket({
  perspective,
  redPacket: placeholderRedPacket,
  redPacketId,
  onNavigateBack,
}: RedPacketProps) {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const chain = useAtomValue(chainAtom);

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
    [redPacket, token],
  );

  const claimedAmount = useMemo(
    () =>
      new BigNumber(redPacket?.claimedAmount ?? 0).shiftedBy(-(token?.decimals ?? 0)).toString(),
    [redPacket, token],
  );

  const status = useMemo(
    () => (redPacket ? getRedPacketStatus(redPacket) : undefined),
    [redPacket],
  );

  const handleBack = useCallback(() => onNavigateBack?.(), [onNavigateBack]);

  const handleViewClaims = useCallback(
    () => appSdk.events.emit("redpacket:view_claims", { redPacketId }),
    [appSdk, redPacketId],
  );

  const handleShare = useCallback(() => {
    appSdk.events.emit("redpacket:share", { redPacketId, redPacket });
  }, [appSdk, redPacketId, redPacket]);

  if (!redPacket || isLoadingToken) {
    return <Skeletons sent={perspective === "sent"} onBack={handleBack} />;
  }

  return (
    <Wrapper>
      <Header sent={perspective === "sent"} onBack={handleBack} />
      {/* amount info */}
      <div className="lg:mt-4 mx-auto flex flex-col gap-4 items-center">
        {/* amount title */}
        {perspective === "received" && (
          <div className="flex items-center gap-2">
            <RedPacketIcon width={16} height={16} />
            <h2 className="text-neutral">{t("extend.redpacket.info.received.from")}</h2>
            <p className="font-medium">{formatShortAddress(redPacket.creator)}</p>
          </div>
        )}
        {perspective === "sent" && (
          <h2 className="text-neutral">{t("extend.redpacket.info.sent.amount_title")}</h2>
        )}

        {/* amount */}
        <div className="flex items-center gap-2">
          <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol} size={36} />
          <p className="text-2xl font-bold">{totalAmount}</p>
          <p className="text-2xl font-bold text-neutral">{token?.symbol}</p>
        </div>

        {/* memo */}
        {redPacket.memo && (
          <div className="flex items-center gap-2">
            <RedPacketMemoIcon width={16} height={16} />
            <p className="text-xs">{redPacket.memo}</p>
          </div>
        )}
      </div>

      {/* total & claimed & refunded info */}
      <div className="mt-2">
        {/* total info */}
        <div className="w-full h-[88px] py-2">
          <div className="w-full h-full bg-content2 rounded-lg px-4 py-3 flex flex-col justify-between">
            {/* title & time */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-foreground">{t("extend.redpacket.info.total_title")}</h3>
              <p className="text-xs text-neutral">
                {new Date(redPacket.createdAt).toLocaleString()}
              </p>
            </div>
            {/* total amount & max claims */}
            <div className="flex items-center justify-between">
              {/* total amount */}
              <div className="flex items-center gap-2">
                <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol} size={24} />
                <p className="text-xs space-x-1">
                  <span>{totalAmount}</span>
                  <span className="text-neutral">{token?.symbol}</span>
                </p>
              </div>
              {/* max claims */}
              <p className="text-xs text-neutral">
                {redPacket.maxClaims > 1
                  ? t("extend.redpacket.info.n_red_packets", { count: redPacket.maxClaims })
                  : t("extend.redpacket.info.1_red_packet", { count: redPacket.maxClaims })}
              </p>
            </div>
          </div>
        </div>
        {/* claimed info */}
        <div className="w-full h-[88px] py-2">
          <div
            className="w-full h-full bg-content2 rounded-lg px-4 py-3 flex flex-col justify-between"
            onClick={handleViewClaims}
          >
            {/* title */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-foreground">{t("extend.redpacket.info.claimed_title")}</h3>
              <ForwardOutlinedIcon className="text-neutral" />
            </div>
            {/* claimed amount & count */}
            <div className="flex items-center justify-between">
              {/* claimed amount */}
              <div className="flex items-center gap-2">
                <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol} size={24} />
                <p className="text-xs space-x-1">
                  <span>{claimedAmount}</span>
                  <span className="text-neutral">{token?.symbol}</span>
                </p>
              </div>
              {/* claimed count */}
              <p className="text-xs text-neutral">
                {redPacket.claimedCount > 1
                  ? t("extend.redpacket.info.n_red_packets", { count: redPacket.claimedCount })
                  : t("extend.redpacket.info.1_red_packet", { count: redPacket.claimedCount })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* share */}
      {perspective === "sent" && status === "ongoing" && (
        <Button
          fullWidth
          color="primary"
          className="rounded-lg mt-2"
          disableRipple
          onPress={handleShare}
        >
          {t("extend.redpacket.share.action")}
        </Button>
      )}

      {/* view on explorer */}
      <Button
        as={Link}
        href={chainTxExplorer(chain, redPacket.txHash)}
        target="_blank"
        className="mt-2 bg-transparent text-xs text-neutral"
        endContent={<ExternalLinkOutlinedIcon width={12} height={12} className="text-neutral" />}
        disableRipple
      >
        {t("extend.redpacket.info.view_on_explorer")}
      </Button>
    </Wrapper>
  );
}

function Wrapper({ children }: PropsWithChildren) {
  return <div className="w-full flex flex-col px-6 py-4 max-lg:px-4 max-lg:py-0">{children}</div>;
}

function Header({ sent, onBack }: { sent: boolean; onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="h-8 max-lg:h-[var(--header-height)] max-lg:pb-2 flex justify-between items-center">
      <div className="flex items-center">
        {/* go back */}
        <Button
          isIconOnly
          className="w-8 min-w-0 h-8 min-h-0 rounded bg-transparent lg:hidden"
          onPress={onBack}
          disableRipple
        >
          <BackwardOutlinedIcon />
        </Button>
        {/* title */}
        <h1 className="text-lg font-medium">
          {t(sent ? "redpacket.info.sent.title" : "redpacket.info.received.title")}
        </h1>
      </div>
    </div>
  );
}

function Skeletons({ sent, onBack }: { sent: boolean; onBack: () => void }) {
  return (
    <Wrapper>
      {/* header */}
      <Header sent={sent} onBack={onBack} />
      {/* amount */}
      <Skeleton className="lg:mt-4 rounded-lg w-[180px] h-[120px] mx-auto" />
      {/* total & claimed & refunded */}
      <div className="mt-2 py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
    </Wrapper>
  );
}

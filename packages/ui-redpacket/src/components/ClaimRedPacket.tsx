import { RedPacketIcon } from "../icons";
import { RedPacketDTO } from "@chainstream-io/sdk";
import { Button, Image, Link } from "@heroui/react";
import { chainIcon, chainTxExplorer } from "@liberfi/core";
import {
  useClaimRedPacketMutation,
  useSendRedPacketTransactionMutation,
} from "@liberfi/react-redpacket";
import {
  chainAtom,
  useAppSdk,
  useAuth,
  useAuthenticatedCallback,
  useTimerToast,
  useTranslation,
  useWaitForTransactionConfirmation,
  useWallet,
} from "@liberfi/ui-base";
import { formatShortAddress } from "@liberfi/ui-dex/libs/format";
import { useAtomValue } from "jotai";
import { useState } from "react";

export type ClaimRedPacketProps = {
  redPacket: RedPacketDTO;
  onNavigateBack?: () => void;
};

export function ClaimRedPacket({ redPacket, onNavigateBack }: ClaimRedPacketProps) {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const chain = useAtomValue(chainAtom);

  const toast = useTimerToast();

  const [isClaiming, setIsClaiming] = useState(false);

  const { user } = useAuth();

  const walletInstance = useWallet();

  const { mutateAsync: claimRedPacket } = useClaimRedPacketMutation();

  const { mutateAsync: sendRedPacketTransaction } = useSendRedPacketTransactionMutation();

  const waitTxConfirm = useWaitForTransactionConfirmation();

  const handleClaim = useAuthenticatedCallback(async () => {
    if (!user?.solanaAddress || !walletInstance) return;

    setIsClaiming(true);
    try {
      // build tx
      const { txSerialize } = await claimRedPacket({
        chain,
        shareId: redPacket.shareId,
        claimer: user.solanaAddress,
      });

      // sign tx
      const signedTxBuffer = await walletInstance.signTransaction(Buffer.from(txSerialize, "base64"));
      const signedTx = Buffer.from(signedTxBuffer).toString("base64");

      // send tx
      const result = await sendRedPacketTransaction({ chain, signedTx });
      console.debug("send red packet claim transaction result", result);

      const txHash = result.signature;
      const txExplorerUrl = chainTxExplorer(chain, txHash);
      const chainIconUrl = chainIcon(chain) ?? "";

      toast({
        id: txHash,
        type: "success",
        message: t("extend.redpacket.claim.transaction_submitted"),
        progress: true,
        duration: 45000,
      });

      onNavigateBack?.();

      // wait for tx confirmed
      waitTxConfirm(
        txHash,
        () => {
          toast({
            id: txHash,
            type: "success",
            duration: 5000,
            message: t("extend.redpacket.claim.transaction_completed"),
            endContent: (
              <Button
                as={Link}
                href={txExplorerUrl}
                target="_blank"
                isIconOnly
                className="bg-transparent w-6 min-w-0 h-6 min-h-0"
              >
                <Image src={chainIconUrl} width={16} height={16} />
              </Button>
            ),
          });

          appSdk.events.emit("redpacket:view", {
            perspective: "received",
            redPacketId: redPacket.id,
          });
        },
        () => {
          toast({
            id: txHash,
            type: "error",
            duration: 5000,
            message: t("extend.redpacket.create.transaction_confirm_error"),
            endContent: (
              <Button
                as={Link}
                href={txExplorerUrl}
                target="_blank"
                isIconOnly
                className="bg-transparent w-6 min-w-0 h-6 min-h-0"
              >
                <Image src={chainIconUrl} width={16} height={16} />
              </Button>
            ),
          });
        },
      );
    } catch (e) {
      console.error("claim red packet error", e);
      if (e instanceof Error && "response" in e && e.response instanceof Response) {
        try {
          const bodyText = await e.response.text();
          const { message, details } = JSON.parse(bodyText ?? "{}") as {
            message?: string;
            details?: string;
          };
          toast({
            type: "error",
            message: details ?? message ?? t("extend.redpacket.claim.transaction_error"),
          });
        } catch (e1) {
          console.error("parse claim red packet exception error", e1);
          toast({ type: "error", message: t("extend.redpacket.claim.transaction_error") });
        }
      } else {
        toast({ type: "error", message: t("extend.redpacket.claim.transaction_error") });
      }
    } finally {
      setIsClaiming(false);
    }
  }, [
    claimRedPacket,
    walletInstance,
    sendRedPacketTransaction,
    waitTxConfirm,
    appSdk.events,
    t,
    toast,
    user?.solanaAddress,
    chain,
    redPacket.id,
    redPacket.shareId,
    onNavigateBack,
  ]);

  return (
    <div className="w-full flex flex-col p-6 items-center">
      {/* from */}
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold text-neutral">
          {t("extend.redpacket.info.received.from")}
        </div>
        <div className="text-lg font-bold">{formatShortAddress(redPacket.creator)}</div>
      </div>

      {/* animation */}
      <RedPacketIcon width={128} height={128} className="mt-14 animate-bounce" />

      {/* memo */}
      <p className="mt-4 text-neutral font-medium">{t("extend.redpacket.claim.message")}</p>
      {redPacket.memo && <p className="mt-2 font-semibold">{redPacket.memo}</p>}

      <Button
        fullWidth
        color="primary"
        className="mt-6 rounded-lg"
        onPress={handleClaim}
        disableRipple
        isLoading={isClaiming}
      >
        {t("extend.redpacket.claim.action")}
      </Button>
    </div>
  );
}

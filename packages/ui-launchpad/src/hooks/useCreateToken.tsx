import { useCallback } from "react";
import { Button, Image, Link } from "@heroui/react";
import { SendTxInputSubmitType } from "@chainstream-io/sdk";
import { chainIcon } from "@liberfi/core";
import { useSendTransactionMutation } from "@liberfi/react-dex";
import { CreateTokenParams, useCreateTokenMutation } from "@liberfi/react-launchpad";
import {
  useTimerToast,
  useTranslation,
  useWaitForTransactionConfirmation,
  useWallet,
} from "@liberfi/ui-base";
import { getTxExplorerUrl } from "@liberfi/ui-dex/dist/libs";

export const useCreateToken = () => {
  const { t } = useTranslation();

  const { mutateAsync: createTokenAsync } = useCreateTokenMutation();

  const { mutateAsync: sendTransactionAsync } = useSendTransactionMutation();

  const walletInstance = useWallet();

  const waitTransactionConfirmation = useWaitForTransactionConfirmation();

  const toast = useTimerToast();

  return useCallback(
    async (params: CreateTokenParams) => {
      try {
        if (!walletInstance) return;

        // build tx
        const { serializedTx } = await createTokenAsync(params);

        // sign tx
        const signedTxBuffer = await walletInstance.signTransaction(Buffer.from(serializedTx, "base64"));
        const signedTx = Buffer.from(signedTxBuffer).toString("base64");

        // send tx
        const result = await sendTransactionAsync({
          chain: params.chain,
          signedTx,
          submitType: SendTxInputSubmitType.default,
          // options: { sendMode: "jito" },
        });
        console.info("send mint transaction result", result);

        const txHash = result.signature;

        toast({
          id: txHash,
          type: "success",
          message: t("extend.launchpad.mint_transaction_submitted"),
          progress: true,
          duration: 45000,
        });

        // wait for tx confirmed
        waitTransactionConfirmation(
          txHash,
          () => {
            toast({
              id: txHash,
              type: "success",
              duration: 5000,
              message: t("extend.launchpad.mint_transaction_completed"),
              endContent: (
                <Button
                  as={Link}
                  href={getTxExplorerUrl(params.chain, txHash)}
                  target="_blank"
                  isIconOnly
                  className="bg-transparent w-6 min-w-0 h-6 min-h-0"
                >
                  <Image src={chainIcon(params.chain) ?? ""} width={16} height={16} />
                </Button>
              ),
            });
          },
          () => {
            toast({
              id: txHash,
              type: "error",
              duration: 5000,
              message: t("extend.launchpad.mint_transaction_uncompleted"),
              endContent: (
                <Button
                  as={Link}
                  href={getTxExplorerUrl(params.chain, txHash)}
                  target="_blank"
                  isIconOnly
                  className="bg-transparent w-6 min-w-0 h-6 min-h-0"
                >
                  <Image src={chainIcon(params.chain) ?? ""} width={16} height={16} />
                </Button>
              ),
            });
          },
        );
      } catch (e: unknown) {
        console.error("send mint transaction error", e);

        if (e instanceof Error && "response" in e && e.response instanceof Response) {
          try {
            const bodyText = await e.response.text();
            const body = JSON.parse(bodyText ?? "{}") as { message?: string; details?: string };
            toast({
              type: "error",
              message: body.details ?? body.message ?? t("extend.launchpad.mint_transaction_error"),
            });
            // eslint-disable-next-line unused-imports/no-unused-vars
          } catch (_e2) {
            toast({
              type: "error",
              message: t("extend.launchpad.mint_transaction_error"),
            });
          }
        } else {
          toast({
            type: "error",
            message: e instanceof Error ? e.message : t("extend.launchpad.mint_transaction_error"),
          });
        }
      }
    },
    [
      createTokenAsync,
      walletInstance,
      sendTransactionAsync,
      toast,
      t,
      waitTransactionConfirmation,
    ],
  );
};

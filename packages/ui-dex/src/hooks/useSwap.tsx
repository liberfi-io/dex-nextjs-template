import { useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { fetchSwapRoute, sendTransaction, useDexClient } from "@liberfi/react-dex";
import {
  chainAtom,
  useAuth,
  useTimerToast,
  useTranslation,
  useWaitForTransactionConfirmation,
  useWallet,
} from "@liberfi/ui-base";
import {
  SendTxInputSubmitType,
  SwapRouteInputDex,
  SwapRouteInputSwapMode,
} from "@chainstream-io/sdk";
import { BigNumber } from "bignumber.js";
import { chainIcon, getWrappedTokenAddress } from "@liberfi/core";
import { Button, Image, Link } from "@heroui/react";
import { getTxExplorerUrl } from "@/libs";

export type SwapOptions = {
  // input token address
  from: string;
  // output token address
  to: string;
  // input token amount in decimals
  amount: string;
  // slippage from 0 to 100
  slippage: number;
  // priority fee in decimals
  priorityFee: string;
  // tip fee in decimals
  tipFee: string;
  // anti mev
  isAntiMev: boolean | "off" | "reduced" | "secure";
};

export function useSwap() {
  const { t } = useTranslation();

  const toast = useTimerToast();

  const dexClient = useDexClient();

  const chain = useAtomValue(chainAtom);

  const { user } = useAuth();

  const walletInstance = useWallet();

  const waitSwapConfirmation = useWaitForTransactionConfirmation();

  const [isSwapping, setIsSwapping] = useState(false);

  // swap token, return true if the transaction is submitted successfully, false otherwise
  const swap = useCallback(
    async ({
      from,
      to,
      amount,
      slippage,
      priorityFee,
      tipFee,
      isAntiMev,
    }: SwapOptions): Promise<boolean> => {
      // TODO using wallet interface instead
      if (!user?.solanaAddress || !walletInstance) return false;

      setIsSwapping(true);

      try {
        // route
        const { serializedTx } = await fetchSwapRoute(dexClient, {
          chain,
          dex: SwapRouteInputDex.jupiter,
          // TODO using wallet interface instead
          userAddress: user.solanaAddress,
          amount: new BigNumber(amount).toString(),
          swapMode: SwapRouteInputSwapMode.ExactIn,
          slippage,
          priorityFee,
          tipFee,
          isAntiMev:
            typeof isAntiMev === "boolean" ? isAntiMev : isAntiMev === "off" ? false : true,
          inputMint: getWrappedTokenAddress(chain, from) ?? from,
          outputMint: getWrappedTokenAddress(chain, to) ?? to,
        });

        // sign tx
        const signedTxBuffer = await walletInstance.signTransaction(Buffer.from(serializedTx, "base64"));
        const signedTx = Buffer.from(signedTxBuffer).toString("base64");

        // send tx
        const { signature, jobId } = await sendTransaction(dexClient, {
          chain,
          signedTx,
          submitType: SendTxInputSubmitType.default,
          options: { isAntiMev },
        });
        console.info("send swap transaction signature", signature);

        toast({
          id: signature,
          type: "success",
          message: t("extend.account.convert_transaction_submitted"),
          progress: true,
          duration: 45000,
        });

        waitSwapConfirmation(
          jobId,
          () =>
            toast({
              id: signature,
              type: "success",
              duration: 5000,
              message: t("extend.account.convert_transaction_completed"),
              endContent: (
                <Button
                  as={Link}
                  href={getTxExplorerUrl(chain, signature)}
                  target="_blank"
                  isIconOnly
                  className="bg-transparent w-6 min-w-0 h-6 min-h-0"
                >
                  <Image src={chainIcon(chain) ?? ""} width={16} height={16} />
                </Button>
              ),
            }),
          () =>
            toast({
              id: signature,
              type: "error",
              duration: 5000,
              message: t("extend.account.convert_transaction_uncompleted"),
              endContent: (
                <Button
                  as={Link}
                  href={getTxExplorerUrl(chain, signature)}
                  target="_blank"
                  isIconOnly
                  className="bg-transparent w-6 min-w-0 h-6 min-h-0"
                >
                  <Image src={chainIcon(chain) ?? ""} width={16} height={16} />
                </Button>
              ),
            }),
        );

        return true;
      } catch (e) {
        if (e instanceof Error && "response" in e && e.response instanceof Response) {
          try {
            const bodyText = await e.response.text();
            const body = JSON.parse(bodyText ?? "{}") as {
              message?: string;
              details?: string;
            };
            toast({
              type: "error",
              message: body.details ?? body.message ?? t("extend.account.convert_transaction_error"),
            });
            // eslint-disable-next-line unused-imports/no-unused-vars
          } catch (_e2) {
            toast({
              type: "error",
              message: t("extend.account.convert_transaction_error"),
            });
          }
        } else {
          toast({
            type: "error",
            message: e instanceof Error ? e.message : t("extend.account.convert_transaction_error"),
          });
        }
        return false;
      } finally {
        setIsSwapping(false);
      }
    },
    [dexClient, chain, user, walletInstance, waitSwapConfirmation, toast, t],
  );

  return useMemo(
    () => ({
      swap,
      isSwapping,
    }),
    [swap, isSwapping],
  );
}

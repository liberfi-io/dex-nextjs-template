import { useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Button, Form, Image, Link } from "@heroui/react";
import BigNumber from "bignumber.js";
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";
import { chainIcon, txExplorerUrl } from "@liberfi.io/utils";
import {
  useCreateFixedAmountRedPacketMutation,
  useSendRedPacketTransactionMutation,
} from "@liberfi/react-redpacket";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  useAppSdk,
  useAuth,
  useAuthenticatedCallback,
  useTimerToast,
  useTranslation,
  useWaitForTransactionConfirmation,
  useWallet,
} from "@liberfi/ui-base";
import { RedPacketMaxClaimsInput } from "./RedPacketMaxClaimsInput";
import { RedPacketMemoInput } from "./RedPacketMemoInput";
import { RedPacketCreateOptions } from "./RedPacketCreateOptions";
import { RedPacketMintAmountInput } from "./RedPacketMintAmountInput";
import { getWrappedAddress } from "@liberfi/ui-dex/libs/wallet";

// TODO zod
export type FixedRedPacketFormValues = {
  mint: {
    address?: string;
    amount?: string;
    token?: Token;
    balance?: WalletNetWorthItemDTO;
  };
  maxClaims: string;
  memo?: string;
  options?: {
    newUser?: boolean;
    followTwitter?: boolean;
    twitterUsername?: string;
  };
};

export function FixedRedPacketForm() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const toast = useTimerToast();

  const { user } = useAuth();

  const walletInstance = useWallet();

  const { chain } = useCurrentChain();

  const formMethods = useForm<FixedRedPacketFormValues>({
    reValidateMode: "onBlur",
  });

  const { handleSubmit, control, reset } = formMethods;

  const amount = useWatch({ control, name: "mint.amount" });

  const maxClaims = useWatch({ control, name: "maxClaims" });

  const token = useWatch({ control, name: "mint.token" });

  const balance = useWatch({ control, name: "mint.balance" });

  const totalAmount = useMemo(() => {
    if (!amount || !maxClaims) return undefined;
    return new BigNumber(amount).times(maxClaims).toString();
  }, [amount, maxClaims]);

  const error = useMemo(
    () =>
      totalAmount && balance
        ? new BigNumber(totalAmount).gt(balance.amount)
          ? t("extend.redpacket.create.amount_error_exceeds_balance")
          : undefined
        : undefined,
    [t, totalAmount, balance],
  );

  const { mutateAsync: createRedPacketAsync } = useCreateFixedAmountRedPacketMutation();

  const { mutateAsync: sendTransactionAsync } = useSendRedPacketTransactionMutation();

  const waitTxConfirm = useWaitForTransactionConfirmation();

  const [isCreating, setIsCreating] = useState(false);

  const onSubmit = useAuthenticatedCallback(
    async (data: FixedRedPacketFormValues) => {
      if (
        !user?.solanaAddress ||
        !data.mint.address ||
        !data.mint.amount ||
        !data.mint.token ||
        !walletInstance
      ) {
        return;
      }

      setIsCreating(true);

      try {
        // build tx
        const { txSerialize, shareId } = await createRedPacketAsync({
          chain,
          creator: user.solanaAddress,
          mint: getWrappedAddress(chain, data.mint.address) ?? data.mint.address,
          maxClaims: parseInt(data.maxClaims),
          fixedAmount: new BigNumber(data.mint.amount)
            .shiftedBy(data.mint.token.decimals)
            .toString(),
          memo: data.memo,
        });

        // sign tx
        const signedTxBuffer = await walletInstance.signTransaction(
          Buffer.from(txSerialize, "base64"),
        );
        const signedTx = Buffer.from(signedTxBuffer).toString("base64");

        // send tx
        const result = await sendTransactionAsync({ chain, signedTx });
        console.debug("send red packet transaction result", result);

        const txHash = result.signature;
        const txUrl = txExplorerUrl(chain, txHash);
        const chainIconUrl = chainIcon(chain) ?? "";

        toast({
          id: txHash,
          type: "success",
          message: t("extend.redpacket.create.transaction_submitted"),
          progress: true,
          duration: 45000,
        });

        reset();

        // wait for tx confirmed
        waitTxConfirm(
          txHash,
          () => {
            appSdk.events.emit("redpacket:share", { redPacketId: shareId });

            toast({
              id: txHash,
              type: "success",
              duration: 5000,
              message: t("extend.redpacket.create.transaction_completed"),
              endContent: (
                <Button
                  as={Link}
                  href={txUrl}
                  target="_blank"
                  isIconOnly
                  className="bg-transparent w-6 min-w-0 h-6 min-h-0"
                >
                  <Image src={chainIconUrl} width={16} height={16} />
                </Button>
              ),
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
                  href={txUrl}
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
        console.error("send red packet transaction error", e);

        if (e instanceof Error && "response" in e && e.response instanceof Response) {
          try {
            const bodyText = await e.response.text();
            const body = JSON.parse(bodyText ?? "{}") as { message?: string; details?: string };
            toast({
              type: "error",
              message:
                body.details ?? body.message ?? t("extend.redpacket.create.transaction_error"),
            });
          } catch (e2) {
            console.error("create red packet parse exception error", e2);
            toast({
              type: "error",
              message: t("extend.redpacket.create.transaction_error"),
            });
          }
        } else {
          toast({
            type: "error",
            message:
              e instanceof Error ? e.message : t("extend.redpacket.create.transaction_error"),
          });
        }
      } finally {
        setIsCreating(false);
      }
    },
    [
      chain,
      user?.solanaAddress,
      t,
      appSdk,
      toast,
      createRedPacketAsync,
      walletInstance,
      sendTransactionAsync,
      waitTxConfirm,
    ],
  );

  return (
    <FormProvider {...formMethods}>
      <Form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {/* mint token & amount */}
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-sm text-neutral">
            {t("extend.redpacket.create.random.amount_label")}
          </h2>
          <RedPacketMintAmountInput />
        </div>

        {/* max claims */}
        <RedPacketMaxClaimsInput />

        {/* memo */}
        <RedPacketMemoInput />

        {/* total amount */}
        <div className="w-full flex flex-col gap-1">
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-neutral">
              {t("extend.redpacket.create.fixed.total_amount_label")}
            </div>
            <div className="text-sm text-foreground">
              {totalAmount && token ? `${totalAmount} ${token.symbol}` : "--"}
            </div>
          </div>
          {error && <div className="text-xs max-sm:text-xxs text-danger">{error}</div>}
        </div>

        {/* options */}
        <RedPacketCreateOptions />

        {/* submit */}
        <Button
          fullWidth
          type="submit"
          color="primary"
          className="rounded-lg"
          isLoading={isCreating}
          disableRipple
        >
          {t("extend.redpacket.create.submit")}
        </Button>
      </Form>
    </FormProvider>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useAtomValue } from "jotai";
import BigNumber from "bignumber.js";
import { Button, Input } from "@heroui/react";
import { useTokenQuery } from "@liberfi/react-dex";
import {
  ArrowDownOutlinedIcon,
  chainAtom,
  useAppSdk,
  useAuthenticatedCallback,
  useTranslation,
  walletBalancesAtom,
} from "@liberfi/ui-base";
import { TokenAvatar } from "@liberfi/ui-dex/dist/components/TokenAvatar";
import { WithdrawOutlinedIcon } from "@liberfi/ui-dex/dist/assets/icons";
import { Number } from "@liberfi/ui-dex/dist/components/Number";
import { Token, WalletBalanceDetailDTO } from "@chainstream-io/sdk";

export function RedPacketMintAmountInput() {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<{
    mint: {
      address?: string;
      amount?: string;
      token?: Token;
      balance?: WalletBalanceDetailDTO;
    };
  }>();

  const chainId = useAtomValue(chainAtom);

  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const error = useMemo(() => errors.mint?.amount?.message, [errors.mint?.amount]);

  // watch mint token address
  const tokenAddress = useWatch({ control, name: "mint.address" });

  // watch mint token amount
  const amount = useWatch({ control, name: "mint.amount" });

  // wallet balances
  const wallet = useAtomValue(walletBalancesAtom);

  // set default mint token address
  useEffect(() => {
    if (!tokenAddress && wallet?.balances && wallet.balances.length > 0) {
      const tokenAddress = wallet.balances[0].tokenAddress;
      setValue("mint.address", tokenAddress);
    }
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, tokenAddress]);

  // mint token balance
  const tokenBalance = useMemo(
    () => (wallet?.balances ?? []).find((it) => tokenAddress && it.tokenAddress === tokenAddress),
    [wallet, tokenAddress],
  );

  useEffect(() => {
    if (tokenBalance) {
      setValue("mint.balance", tokenBalance);
    }
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenBalance]);

  // mint token info
  const { data: token } = useTokenQuery(chainId, tokenAddress ?? "", {
    enabled: !!tokenAddress,
  });

  useEffect(() => {
    if (token) {
      setValue("mint.token", token);
    }
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // validate mint token amount
  const amountRules = useMemo(() => {
    return {
      validate: (value?: string) => {
        if (!value || value.trim() === "") {
          return t("extend.redpacket.create.amount_error_required");
        }
        if (new BigNumber(value).lte(0)) {
          return t("extend.redpacket.create.amount_error_is_positive");
        }
        if (tokenBalance?.amount) {
          if (new BigNumber(value).gt(tokenBalance.amount)) {
            return t("extend.redpacket.create.amount_error_exceeds_balance");
          }
        }
        const tokenAddress = getValues("mint.address");
        if (!tokenAddress) {
          return t("extend.redpacket.create.mint_address_error_required");
        }
        return true;
      },
    };
    // getValues should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, tokenBalance?.amount]);

  // send select mint token request
  const [requestId, setRequestId] = useState<number | undefined>(undefined);

  const handleSelectToken = useAuthenticatedCallback(() => {
    const id = Date.now();
    appSdk.events.emit("select_asset", { method: "select_asset", id, params: {} });
    setRequestId(id);
  }, [appSdk, setRequestId]);

  // handle mint token selection
  useEffect(() => {
    const handler = (options: {
      method: "response";
      id?: number | undefined;
      params: { tokenAddress: string };
    }) => {
      if (options.id === requestId) {
        setValue("mint.address", options.params.tokenAddress);
        setValue("mint.amount", undefined);
      }
    };
    appSdk.events.on("response", handler);
    return () => {
      appSdk.events.off("response", handler);
    };
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSdk, requestId]);

  // quick inputs
  const handleHalfAmount = useCallback(() => {
    if (!tokenBalance || !token) return;
    const value = new BigNumber(tokenBalance.amount ?? 0)
      .div(2)
      .dp(token.decimals, BigNumber.ROUND_FLOOR)
      .toString();
    setValue("mint.amount", value);
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenBalance, token]);

  const handleMaxAmount = useCallback(() => {
    if (!tokenBalance || !token) return;
    const value = new BigNumber(tokenBalance.amount ?? 0)
      .dp(token.decimals, BigNumber.ROUND_FLOOR)
      .toString();
    setValue("mint.amount", value);
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenBalance, token]);

  // estimated usd amount
  const amountInUsd = useMemo(
    () =>
      amount && token?.marketData?.priceInUsd
        ? new BigNumber(amount).multipliedBy(token.marketData.priceInUsd).toString()
        : undefined,
    [amount, token],
  );

  return (
    <div className="flex flex-col gap-2 bg-content1 rounded-lg p-4">
      {/* mint token address and amount input */}
      <div className="flex items-center gap-2">
        {/* mint amount input */}
        <div className="flex-1">
          <Controller
            control={control}
            name="mint.amount"
            rules={amountRules}
            render={({
              field: { name, onChange, value, onBlur, ref, disabled },
              fieldState: { invalid },
            }) => (
              <Input
                ref={ref}
                type="number"
                name={name}
                value={value?.toString() ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                isInvalid={invalid}
                placeholder={"0"}
                fullWidth
                classNames={{
                  mainWrapper: "gap-1",
                  inputWrapper:
                    "rounded-lg bg-content1 data-[hover=true]:bg-content1 group-data-[focus=true]:bg-content1 " +
                    "group-data-[focus-visible=true]:ring-offset-transparent group-data-[focus-visible=true]:ring-transparent",
                  input: "text-3xl caret-primary placeholder:text-placeholder placeholder:text-3xl",
                }}
              />
            )}
          />
        </div>

        {/* select mint token */}
        <div className="flex-0">
          <Button
            className={clsx(
              "flex min-w-0 h-8 min-h-0 px-3 bg-content2 rounded-full",
              tokenBalance ? "text-foreground" : "text-neutral",
            )}
            startContent={
              tokenBalance && (
                <TokenAvatar size={24} src={tokenBalance.imageUrl} name={tokenBalance.symbol} />
              )
            }
            endContent={<ArrowDownOutlinedIcon width={16} height={16} className="text-neutral" />}
            onPress={handleSelectToken}
            disableRipple
          >
            {tokenBalance ? tokenBalance.symbol : t("extend.redpacket.create.select_mint_token")}
          </Button>
        </div>
      </div>

      {/* mint token balance and estimated usd amount */}
      <div className="flex items-center justify-between gap-1">
        {/* estimated usd amount */}
        <div className="flex-1 text-neutral text-xs max-sm:text-xxs">
          ≈ <Number value={amountInUsd ?? 0} abbreviate defaultCurrencySign="$" />
        </div>
        {/* mint token balance */}
        {tokenBalance && (
          <div className="flex-0 flex items-center gap-2 px-3 text-xs max-sm:text-xxs">
            {/* balance */}
            <WithdrawOutlinedIcon width={12} hanging={12} className="text-neutral" />
            <span className="text-neutral">
              {tokenBalance ? <Number value={tokenBalance.amount} abbreviate /> : "--"}{" "}
              {tokenBalance ? tokenBalance.symbol : ""}
            </span>
            {/* quick inputs */}
            <span className="text-primary cursor-pointer" onClick={handleHalfAmount}>
              {t("extend.account.transfer_amount_half")}
            </span>
            <span className="text-primary cursor-pointer" onClick={handleMaxAmount}>
              {t("extend.account.transfer_amount_max")}
            </span>
          </div>
        )}
      </div>

      {error && <div className="text-danger text-xs max-sm:text-xxs">{error}</div>}
    </div>
  );
}

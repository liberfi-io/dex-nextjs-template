/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowDownIcon, ArrowUpIcon, TradeOutlinedIcon, WithdrawOutlinedIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import { useTokensQuery } from "@liberfi/react-dex";
import BigNumber from "bignumber.js";
import { keyBy, uniq } from "lodash-es";
import {
  Button,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { ChainAddress } from "../ChainAddress";
import { Number } from "../Number";
import { TokenAvatar } from "../TokenAvatar";
import { useCallback, useMemo, useState } from "react";
import { useSwapContext } from "./SwapContext";

export type PreviewModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function PreviewModal({ isOpen, onOpenChange }: PreviewModalProps) {
  const { t } = useTranslation();

  const {
    chainId,
    fromToken,
    fromTokenBalance,
    toToken,
    routeInfo,
    routeError,
    isRouting,
    isSwapping,
    swap,
  } = useSwapContext();

  // 查看明细
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  // 路由信息中包含的所有 token
  const routeTokenAddresses = useMemo(() => {
    if (!routeInfo) return [];
    const tokenAddresses = [
      (routeInfo.routeInfo as any).inputMint,
      (routeInfo.routeInfo as any).outputMint,
    ];
    (routeInfo.routeInfo as any).routePlan.forEach((plan: any) => {
      tokenAddresses.push(plan.swapInfo.feeMint);
      tokenAddresses.push(plan.swapInfo.inputMint);
      tokenAddresses.push(plan.swapInfo.outputMint);
    });
    return uniq(tokenAddresses);
  }, [routeInfo]);

  const { data: routeTokens } = useTokensQuery({
    chain: chainId,
    tokenAddresses: routeTokenAddresses,
  });

  const routeTokenMap = useMemo(() => keyBy(routeTokens ?? [], "address"), [routeTokens]);

  // 支付 token
  const inToken = useMemo(
    () =>
      routeInfo?.routeInfo ? routeTokenMap[(routeInfo.routeInfo as any).inputMint] : undefined,
    [routeInfo, routeTokenMap],
  );

  // 获得 token
  const outToken = useMemo(
    () =>
      routeInfo?.routeInfo ? routeTokenMap[(routeInfo.routeInfo as any).outputMint] : undefined,
    [routeInfo, routeTokenMap],
  );

  // 支付数量
  const inAmount = useMemo(() => {
    const amount = routeInfo?.routeInfo ? (routeInfo.routeInfo as any).inAmount : undefined;
    return amount && inToken
      ? new BigNumber(amount).shiftedBy(-inToken.decimals).toString()
      : undefined;
  }, [routeInfo, inToken]);

  // 获得数量
  const outAmount = useMemo(() => {
    const amount = routeInfo?.routeInfo ? (routeInfo.routeInfo as any).outAmount : undefined;
    return amount && outToken
      ? new BigNumber(amount).shiftedBy(-outToken.decimals).toString()
      : undefined;
  }, [routeInfo, outToken]);

  // 支付金额
  const inAmountUsd = useMemo(
    () =>
      inAmount && inToken?.marketData?.priceInUsd
        ? new BigNumber(inAmount).multipliedBy(inToken.marketData.priceInUsd).toString()
        : undefined,
    [inAmount, inToken?.marketData?.priceInUsd],
  );

  // 获得金额
  const outAmountUsd = useMemo(
    () =>
      outAmount && outToken?.marketData?.priceInUsd
        ? new BigNumber(outAmount).multipliedBy(outToken.marketData.priceInUsd).toString()
        : undefined,
    [outAmount, outToken?.marketData?.priceInUsd],
  );

  // 计算汇率方式
  const [rateTypes, setRateTypes] = useState<Record<string, "from" | "to">>({});

  // 切换计算汇率方式
  const toggleRateType = useCallback(
    (key: string) =>
      setRateTypes((prev) => ({ ...prev, [key]: prev[key] === "to" ? "from" : "to" })),
    [setRateTypes],
  );

  // 明细
  const plans = useMemo(
    () =>
      (routeInfo?.routeInfo && (routeInfo.routeInfo as any).routePlan
        ? (routeInfo.routeInfo as any).routePlan
        : []
      ).map((plan: any) => {
        const key = plan.swapInfo.ammKey;

        const inToken = routeTokenMap[plan.swapInfo.inputMint];
        const outToken = routeTokenMap[plan.swapInfo.outputMint];
        const feeToken = routeTokenMap[plan.swapInfo.feeMint];

        // 支付数量
        const inAmount =
          inToken?.decimals && plan.swapInfo.inAmount
            ? new BigNumber(plan.swapInfo.inAmount).shiftedBy(-inToken.decimals).toString()
            : undefined;

        // 支付金额
        const inAmountUsd =
          inAmount && inToken?.marketData?.priceInUsd
            ? new BigNumber(inAmount).multipliedBy(inToken.marketData.priceInUsd).toString()
            : undefined;

        // 获得数量
        const outAmount =
          outToken?.decimals && plan.swapInfo.outAmount
            ? new BigNumber(plan.swapInfo.outAmount).shiftedBy(-outToken.decimals).toString()
            : undefined;

        // 获得金额
        const outAmountUsd =
          outAmount && outToken?.marketData?.priceInUsd
            ? new BigNumber(outAmount).multipliedBy(outToken.marketData.priceInUsd).toString()
            : undefined;

        // 手续费数量
        const feeAmount =
          feeToken?.decimals && plan.swapInfo.feeAmount
            ? new BigNumber(plan.swapInfo.feeAmount).shiftedBy(-feeToken.decimals).toString()
            : undefined;

        // 手续费金额
        const feeAmountInUsd =
          feeAmount && feeToken?.marketData?.priceInUsd
            ? new BigNumber(feeAmount).multipliedBy(feeToken.marketData.priceInUsd).toString()
            : undefined;

        // 汇率计算方式
        const rateType = rateTypes[key] ?? "from";

        // 计算汇率值
        const rate =
          inAmount && outAmount
            ? rateType === "from"
              ? new BigNumber(outAmount).div(inAmount).toString()
              : new BigNumber(inAmount).div(outAmount).toString()
            : undefined;

        return {
          ...plan,
          key,
          rateType,
          rate,
          inAmount,
          inAmountUsd,
          inToken,
          outAmount,
          outAmountUsd,
          outToken,
          feeAmount,
          feeAmountInUsd,
          feeToken,
        };
      }),
    [routeInfo?.routeInfo, routeTokenMap, rateTypes],
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-content2 rounded-lg">
        <ModalHeader>{t("extend.account.convert_preview")}</ModalHeader>
        <ModalBody>
          <div className="w-full max-h-[70vh] overflow-y-auto py-2 flex-1 flex flex-col">
            {/* From preview */}
            <div className="mb-5">
              <div className="text-neutral flex items-center justify-between text-xs font-medium">
                {t("extend.account.convert_from")}
              </div>
              <div className="w-full h-auto px-4 py-3 rounded-lg bg-content3 mt-3 flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3">
                  <TokenAvatar size={24} src={fromToken?.imageUrl ?? ""} name={fromToken?.symbol} />
                  <div className="flex flex-col justify-center items-start gap-0.5">
                    <div className="text-xs text-foreground">{fromToken?.symbol}</div>
                    <div className="text-xxs text-neutral flex items-center gap-1">
                      <WithdrawOutlinedIcon width={12} height={12} />
                      <span>
                        <Number value={fromTokenBalance?.amount ?? "0"} abbreviate />
                      </span>
                      <span>{fromToken?.symbol}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-0 flex flex-col justify-center items-end gap-0.5">
                  <div className="text-xs text-foreground">
                    <Number value={inAmount ?? "0"} abbreviate />
                  </div>
                  <div className="text-xxs text-neutral">
                    <Number value={inAmountUsd ?? "0"} abbreviate defaultCurrencySign="$" />
                  </div>
                </div>
              </div>
            </div>

            {/* To preview */}
            <div className="mb-5">
              <div className="text-neutral flex items-center justify-between text-xs font-medium">
                {t("extend.account.convert_estimated_receive")}
              </div>
              <div className="w-full h-auto px-4 py-3 rounded-lg bg-content3 mt-3 flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3">
                  <TokenAvatar size={24} src={toToken?.imageUrl ?? ""} name={toToken?.symbol} />
                  <div className="flex flex-col justify-center items-start gap-0.5">
                    <div className="text-xs text-foreground">{toToken?.symbol}</div>
                    <ChainAddress
                      address={toToken?.address ?? ""}
                      className="text-xxs text-neutral"
                    />
                  </div>
                </div>
                <div className="flex-0 flex flex-col justify-center items-end gap-0.5">
                  <div className="text-xs text-foreground">
                    <Number value={outAmount ?? "0"} abbreviate />
                  </div>
                  <div className="text-xxs text-neutral">
                    <Number value={outAmountUsd ?? "0"} abbreviate defaultCurrencySign="$" />
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            {expanded && plans.length > 0 && (
              <div className="my-3">
                <div className="text-neutral flex items-center justify-between text-xs font-medium">
                  {t("extend.account.convert_details")}
                </div>
                <Listbox classNames={{ base: "p-0 mt-3", list: "gap-3" }}>
                  {plans.map((plan: any) => (
                    <ListboxItem
                      key={plan.swapInfo.ammKey}
                      className="p-0 data-[hover=true]:bg-transparent data-[selectable=true]:focus:bg-transparent"
                    >
                      <div className="w-full h-auto px-4 py-3 rounded-lg bg-content3 flex flex-col items-center gap-2">
                        {/* 交易所 */}
                        <div className="w-full flex items-center justify-between">
                          <div className="text-neutral text-xs">{t("extend.account.convert_dex")}</div>
                          <div className="text-foreground text-xs">{plan.swapInfo.label}</div>
                        </div>
                        {/* 兑换 */}
                        <div className="w-full flex items-center justify-between">
                          <div className="text-neutral text-xs">{t("extend.account.convert")}</div>
                          <div className="text-foreground text-xs flex items-center gap-2">
                            <span>
                              <Number value={plan.inAmount} abbreviate /> {plan.inToken?.symbol}
                            </span>
                            <TradeOutlinedIcon width={12} height={12} className="text-foreground" />
                            <span>
                              <Number value={plan.outAmount} abbreviate /> {plan.outToken?.symbol}
                            </span>
                          </div>
                        </div>
                        {/* 汇率 */}
                        <div className="w-full flex items-center justify-between">
                          <div className="text-neutral text-xs">{t("extend.account.convert_rate")}</div>
                          <div className="text-foreground text-xs flex items-center gap-1">
                            {plan.rate !== undefined ? (
                              <>
                                <span>
                                  1{" "}
                                  {plan.rateType === "from"
                                    ? plan.inToken?.symbol
                                    : plan.outToken?.symbol}
                                </span>
                                <span>≈</span>
                                <span>
                                  <Number value={plan.rate} abbreviate />
                                </span>
                                <span>
                                  {plan.rateType === "from"
                                    ? plan.outToken?.symbol
                                    : plan.inToken?.symbol}
                                </span>
                                <Button
                                  isIconOnly
                                  className="flex ml-2 min-w-0 min-h-0 w-auto h-auto p-0 bg-transparent rounded-none"
                                  onPress={() => toggleRateType(plan.key)}
                                  disableRipple
                                >
                                  <TradeOutlinedIcon
                                    width={12}
                                    height={12}
                                    className="text-foreground"
                                  />
                                </Button>
                              </>
                            ) : (
                              "--"
                            )}
                          </div>
                        </div>
                        {/* 手续费等费用 */}
                        <div className="w-full flex items-center justify-between">
                          <div className="text-neutral text-xs">{t("extend.account.convert_fee")}</div>
                          <div className="text-foreground text-xs">
                            {plan.feeAmount && plan.feeAmountInUsd ? (
                              <>
                                <Number value={plan.feeAmount} abbreviate /> {plan.feeToken?.symbol}{" "}
                                (
                                <Number
                                  value={plan.feeAmountInUsd}
                                  abbreviate
                                  defaultCurrencySign="$"
                                />
                                )
                              </>
                            ) : (
                              "--"
                            )}
                          </div>
                        </div>
                      </div>
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            )}

            {/* More / Less toggle */}
            <div className="flex justify-center">
              <Button
                size="sm"
                className="flex bg-transparent text-xs text-neutral"
                endContent={
                  expanded ? (
                    <ArrowUpIcon width={12} height={12} />
                  ) : (
                    <ArrowDownIcon width={12} height={12} />
                  )
                }
                disableRipple
                onPress={toggleExpanded}
              >
                {expanded ? t("extend.common.show_less") : t("extend.common.show_more")}
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            color="primary"
            className="flex rounded-lg"
            disableRipple
            isDisabled={!routeInfo || !!routeError}
            isLoading={(!routeInfo && isRouting) || isSwapping}
            onPress={swap}
          >
            {t("extend.common.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

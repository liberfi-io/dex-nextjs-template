import { CHAIN_ID, chainSlugs } from "@liberfi/core";
import PreviewModal from "../../swap/PreviewModal";
import { SwapProvider } from "../../swap/SwapContext";
import { useDisclosure } from "@heroui/react";
import { getUnwrappedAddress, getWrappedAddress, PRIMARY_TOKEN_ADDRESSES } from "../../../libs";
import { SellForm } from "./SellForm";
import { useCallback, useMemo } from "react";
import { tokenInfoAtom } from "../../../states";
import { useAtomValue } from "jotai";

export type TradeSellProps = {
  classNames?: {
    sellWrapper?: string;
    sellForm?: string;
  };
};

export function TradeSell({ classNames }: TradeSellProps) {
  const token = useAtomValue(tokenInfoAtom);

  const toTokenAddress = useMemo(() => {
    if (!token?.address) return undefined;
    const primaryAddresses = PRIMARY_TOKEN_ADDRESSES[chainSlugs[CHAIN_ID.SOLANA]!];
    const address = primaryAddresses.find(
      (it) =>
        // 不能和卖出代币相同
        it !== token.address &&
        // 不能是卖出代币的包装代币
        it !== getWrappedAddress(CHAIN_ID.SOLANA, token.address) &&
        // 不能是卖出代币的解包装代币
        it !== getUnwrappedAddress(CHAIN_ID.SOLANA, token.address),
    );
    if (address) return address;
    return undefined;
  }, [token?.address]);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleSellComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <SwapProvider
      fromTokenAddress={token?.address}
      toTokenAddress={toTokenAddress}
      onComplete={handleSellComplete}
    >
      <SellForm onSubmit={onOpen} classNames={classNames} />
      <PreviewModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </SwapProvider>
  );
}

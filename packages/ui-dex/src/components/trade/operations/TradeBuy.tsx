import { SwapProvider } from "@/components/swap/SwapContext";
import { BuyForm } from "./BuyForm";
import PreviewModal from "@/components/swap/PreviewModal";
import { useDisclosure } from "@heroui/react";
import { useCallback } from "react";
import { tokenInfoAtom } from "@/states";
import { useAtomValue } from "jotai";

export type TradeBuyProps = {
  classNames?: {
    buyWrapper?: string;
    buyForm?: string;
  };
};

export function TradeBuy({ classNames }: TradeBuyProps) {
  const token = useAtomValue(tokenInfoAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleBuyComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <SwapProvider toTokenAddress={token?.address} onComplete={handleBuyComplete}>
      <BuyForm onSubmit={onOpen} classNames={classNames} />
      <PreviewModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </SwapProvider>
  );
}

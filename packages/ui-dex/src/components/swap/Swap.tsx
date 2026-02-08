import { CHAIN_ID } from "@liberfi/core";
import { SwapForm } from "./SwapForm";
import { SwapProvider } from "./SwapContext";
import PreviewModal from "./PreviewModal";
import { useDisclosure } from "@heroui/react";
import { useCallback } from "react";

export type SwapProps = {
  chainId?: CHAIN_ID;
  fromTokenAddress?: string;
  toTokenAddress?: string;
};

export function Swap({ chainId = CHAIN_ID.SOLANA, fromTokenAddress, toTokenAddress }: SwapProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleSwapComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <SwapProvider
      chainId={chainId}
      fromTokenAddress={fromTokenAddress}
      toTokenAddress={toTokenAddress}
      onComplete={handleSwapComplete}
    >
      <SwapForm onSubmit={onOpen} />
      <PreviewModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </SwapProvider>
  );
}

import { useDisclosure } from "@heroui/react";
import { PreviewModal } from "./PreviewModal";
import { TransferForm } from "./TransferForm";
import { TransferProvider } from "./TransferContext";
import { useCallback } from "react";

export type TransferProps = {
  tokenAddress?: string;
  walletAddress?: string;
};

export function Transfer({ tokenAddress, walletAddress }: TransferProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <TransferProvider
      tokenAddress={tokenAddress}
      walletAddress={walletAddress}
      onComplete={handleComplete}
    >
      <TransferForm onSubmit={onOpen} />
      <PreviewModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </TransferProvider>
  );
}

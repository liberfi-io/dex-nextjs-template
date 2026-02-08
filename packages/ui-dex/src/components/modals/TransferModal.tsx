import { layoutAtom, useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { ModalWrapper } from "../layout";
import { ModalHeaderWrapper } from "../layout/ModalHeaderWrapper";
import { Transfer } from "../transfer";
import { useAtomValue } from "jotai";

export default function TransferModal() {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [tokenAddress, setTokenAddress] = useState<string | undefined>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  // 响应打开 transfer 对话框
  useEffect(() => {
    const handler = (options: {
      method: "transfer";
      id?: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: any;
    }) => {
      setTokenAddress(options.params.tokenAddress);
      setWalletAddress(options.params.walletAddress);
      onOpen();
    };
    appSdk.events.on("transfer", handler);
    return () => {
      appSdk.events.off("transfer", handler);
    };
  }, [onOpen, appSdk]);

  // transfer 结束自动关闭对话框
  useEffect(() => {
    const handler = (options: {
      method: "transfer_result";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: any;
    }) => {
      console.info("transfer modal handles transfer_result", options);
      onClose();
    };
    appSdk.events.on("transfer_result", handler);
    return () => {
      appSdk.events.off("transfer_result", handler);
    };
  }, [onClose, appSdk]);

  return (
    <Modal
      size={layout === "desktop" ? "lg" : "full"}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "max-lg:h-full max-lg:max-h-full max-lg:min-h-full lg:h-fit lg:rounded-lg overflow-hidden",
      }}
    >
      <ModalContent>
        <ModalWrapper className="lg:max-h-fit">
          <ModalHeaderWrapper onClose={onClose}>{t("extend.account.transfer")}</ModalHeaderWrapper>
          <Transfer tokenAddress={tokenAddress} walletAddress={walletAddress} />
        </ModalWrapper>
      </ModalContent>
    </Modal>
  );
}

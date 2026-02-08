import { layoutAtom, useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { Swap } from "../swap";
import { ModalWrapper } from "../layout";
import { ModalHeaderWrapper } from "../layout/ModalHeaderWrapper";
import { CHAIN_ID } from "@liberfi/core";
import { useAtomValue } from "jotai";

export default function SwapModal() {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [chainId, setChainId] = useState<CHAIN_ID | undefined>(undefined);
  const [fromTokenAddress, setFromTokenAddress] = useState<string | undefined>(undefined);
  const [toTokenAddress, setToTokenAddress] = useState<string | undefined>(undefined);

  // 响应打开 swap 对话框
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (options: { method: "swap"; id?: number; params: any }) => {
      setChainId(options.params.chainId);
      setFromTokenAddress(options.params.fromTokenAddress);
      setToTokenAddress(options.params.toTokenAddress);
      onOpen();
    };
    appSdk.events.on("swap", handler);
    return () => {
      appSdk.events.off("swap", handler);
    };
  }, [onOpen, appSdk]);

  // swap 结束自动关闭对话框
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (options: { method: "swap_result"; params: any }) => {
      console.info("swap modal handles swap_result", options);
      onClose();
    };
    appSdk.events.on("swap_result", handler);
    return () => {
      appSdk.events.off("swap_result", handler);
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
          <ModalHeaderWrapper onClose={onClose}>{t("extend.account.convert")}</ModalHeaderWrapper>
          <Swap
            chainId={chainId}
            fromTokenAddress={fromTokenAddress}
            toTokenAddress={toTokenAddress}
          />
        </ModalWrapper>
      </ModalContent>
    </Modal>
  );
}

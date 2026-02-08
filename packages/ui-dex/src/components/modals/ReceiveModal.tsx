import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { useEffect } from "react";
import { Receive } from "../account";

export default function ReceiveModal() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const handler = () => onOpen();
    appSdk.events.on("deposit:open", handler);
    return () => {
      appSdk.events.off("deposit:open", handler);
    };
  }, [onOpen, appSdk]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-content2 rounded-lg">
        <ModalHeader>{t("extend.account.receive")}</ModalHeader>
        <ModalBody>
          <Receive />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

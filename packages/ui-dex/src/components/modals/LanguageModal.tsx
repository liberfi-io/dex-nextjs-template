import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { LanguageSettings } from "../account/settings/LanguageSettings";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { useEffect } from "react";

export default function LanguageModal() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    const handler = () => {
      onOpen();
    };
    appSdk.events.on("select_language", handler);
    return () => {
      appSdk.events.off("select_language", handler);
    };
  }, [onOpen, appSdk]);

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-content2 rounded-lg">
        <ModalHeader>{t("extend.account.settings.language")}</ModalHeader>
        <ModalBody className="pb-6">
          <LanguageSettings onLanguageChange={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useAppSdk } from "@liberfi/ui-base";
import { ShareRedPacket, ShareRedPacketProps } from "./ShareRedPacket";

export function ShareRedPacketModal() {
  const appSdk = useAppSdk();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [shareProps, setShareProps] = useState<ShareRedPacketProps | null>(null);

  useEffect(() => {
    const handler = (shareProps: ShareRedPacketProps) => {
      setShareProps(shareProps);
      onOpen();
    };
    appSdk.events.on("redpacket:share", handler);
    return () => {
      appSdk.events.off("redpacket:share", handler);
    };
  }, [onOpen, appSdk]);

  return (
    <Modal
      size="md"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>{shareProps && <ShareRedPacket {...shareProps} />}</ModalContent>
    </Modal>
  );
}

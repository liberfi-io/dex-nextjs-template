import { useEffect, useState } from "react";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useAppSdk } from "@liberfi/ui-base";
import { RedPacketDTO } from "@chainstream-io/sdk";
import { ClaimRedPacket } from "./ClaimRedPacket";

export function ClaimRedPacketModal() {
  const appSdk = useAppSdk();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [redPacket, setRedPacket] = useState<RedPacketDTO | null>(null);

  useEffect(() => {
    const handler = ({ redPacket }: { redPacket: RedPacketDTO }) => {
      setRedPacket(redPacket);
      onOpen();
    };
    appSdk.events.on("redpacket:claim", handler);
    return () => {
      appSdk.events.off("redpacket:claim", handler);
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
      <ModalContent>
        {redPacket && <ClaimRedPacket redPacket={redPacket} onNavigateBack={onClose} />}
      </ModalContent>
    </Modal>
  );
}

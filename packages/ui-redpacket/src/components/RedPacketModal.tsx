import { useEffect, useState } from "react";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { layoutAtom, useAppSdk } from "@liberfi/ui-base";
import { RedPacket, RedPacketProps } from "./RedPacket";
import { useAtomValue } from "jotai";

export function RedPacketModal() {
  const appSdk = useAppSdk();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [redPacketProps, setRedPacketProps] = useState<RedPacketProps | null>(null);

  useEffect(() => {
    const handler = (props: Omit<RedPacketProps, "onNavigateBack">) => {
      setRedPacketProps(props);
      onOpen();
    };
    appSdk.events.on("redpacket:view", handler);
    return () => {
      appSdk.events.off("redpacket:view", handler);
    };
  }, [onOpen, appSdk]);

  return (
    <Modal
      size={layout === "desktop" ? "sm" : "full"}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {redPacketProps && <RedPacket {...redPacketProps} onNavigateBack={onClose} />}
      </ModalContent>
    </Modal>
  );
}

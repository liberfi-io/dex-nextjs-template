import { useEffect, useState } from "react";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useAppSdk, layoutAtom  } from "@liberfi/ui-base";
import { RedPacketClaims } from "./RedPacketClaims";
import { useAtomValue } from "jotai";

export function RedPacketClaimsModal() {
  const appSdk = useAppSdk();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [redPacketId, setRedPacketId] = useState<string | null>(null);

  useEffect(() => {
    const handler = ({ redPacketId }: { redPacketId: string }) => {
      setRedPacketId(redPacketId);
      onOpen();
    };
    appSdk.events.on("redpacket:view_claims", handler);
    return () => {
      appSdk.events.off("redpacket:view_claims", handler);
    };
  }, [onOpen, appSdk]);

  return (
    <Modal
      size={layout === "desktop" ? "md" : "full"}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "max-lg:h-full max-lg:max-h-full max-lg:min-h-full lg:h-screen lg:rounded-lg overflow-hidden",
      }}
    >
      <ModalContent>
        {redPacketId && <RedPacketClaims redPacketId={redPacketId} onNavigateBack={onClose} />}
      </ModalContent>
    </Modal>
  );
}

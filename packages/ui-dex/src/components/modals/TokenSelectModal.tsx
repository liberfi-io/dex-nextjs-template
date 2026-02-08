import { layoutAtom, useAppSdk } from "@liberfi/ui-base";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Search } from "../search/Search";
import { ModalWrapper } from "../layout";
import { useAtomValue } from "jotai";

export default function TokenSelectModal() {
  const appSdk = useAppSdk();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [requestId, setRequestId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const handler = ({ id }: { method: "select_token"; id?: number | undefined }) => {
      setRequestId(id);
      onOpen();
    };
    appSdk.events.on("select_token", handler);
    return () => {
      appSdk.events.off("select_token", handler);
    };
  }, [onOpen, appSdk]);

  const onSelect = useCallback(
    (chain: string, tokenAddress: string) => {
      onClose();
      appSdk.events.emit("response", {
        method: "response",
        id: requestId,
        params: { chain, tokenAddress },
      });
    },
    [appSdk, onClose, requestId],
  );

  return (
    <Modal
      size={layout === "desktop" ? "lg" : "full"}
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
        <ModalWrapper>
          <Search onClose={onClose} onSelect={onSelect} />
        </ModalWrapper>
      </ModalContent>
    </Modal>
  );
}

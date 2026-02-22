import { layoutAtom, useAppSdk, useRouter } from "@liberfi/ui-base";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useCallback, useEffect } from "react";
import { AppRoute } from "../../libs";
import { Search } from "../search/Search";
import { ModalWrapper } from "../layout";
import { useAtomValue } from "jotai";

export default function SearchModal() {
  const appSdk = useAppSdk();

  const { navigate } = useRouter();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    const handler = () => onOpen();
    appSdk.events.on("search:open", handler);
    return () => {
      appSdk.events.off("search:open", handler);
    };
  }, [onOpen, appSdk]);

  const onSelect = useCallback(
    (chain: string, tokenAddress: string) => {
      onClose();
      navigate(`${AppRoute.trade}/${chain}/${tokenAddress}`);
    },
    [navigate, onClose],
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

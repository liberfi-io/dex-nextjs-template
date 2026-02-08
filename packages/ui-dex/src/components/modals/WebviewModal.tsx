import { layoutAtom, useAppSdk } from "@liberfi/ui-base";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { ModalWrapper } from "../layout";
import { ModalHeaderWrapper } from "../layout/ModalHeaderWrapper";
import { useAtomValue } from "jotai";

export default function WebviewModal() {
  const appSdk = useAppSdk();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [size, setSize] = useState<"lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl">("lg");

  useEffect(() => {
    const handler = ({
      params: { url, title, size },
    }: {
      method: "webview:open";
      id?: number;
      params: { url: string; title: string; size?: "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" };
    }) => {
      setUrl(url);
      setTitle(title);
      if (size) {
        setSize(size);
      }
      onOpen();
    };

    appSdk.events.on("webview:open", handler);
    return () => {
      appSdk.events.off("webview:open", handler);
    };
  }, [onOpen, appSdk, setUrl, setTitle]);

  return (
    <Modal
      size={layout === "desktop" ? size : "full"}
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
          <ModalHeaderWrapper onClose={onClose}>{title}</ModalHeaderWrapper>
          <iframe src={url} title={title} className="flex-1 w-full" />
        </ModalWrapper>
      </ModalContent>
    </Modal>
  );
}

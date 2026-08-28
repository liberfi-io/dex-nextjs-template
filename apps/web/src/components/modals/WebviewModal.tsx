"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { XCloseIcon, useScreen } from "@liberfi.io/ui";
import { browserAppSdk } from "../../application/app-sdk";

type WebviewOpenEvent = {
  method: "webview:open";
  params: {
    url: string;
    title: string;
    size?: "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  };
};

export function WebviewModal() {
  const { isDesktop } = useScreen();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [size, setSize] = useState<"lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl">("lg");

  useEffect(() => {
    const handler = ({ params }: WebviewOpenEvent) => {
      setUrl(params.url);
      setTitle(params.title);
      if (params.size) setSize(params.size);
      onOpen();
    };
    browserAppSdk.events.on("webview:open", handler);
    return () => {
      browserAppSdk.events.off("webview:open", handler);
    };
  }, [onOpen]);

  return (
    <Modal
      size={isDesktop ? size : "full"}
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
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-white truncate">{title}</h3>
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
              <XCloseIcon className="w-4 h-4" />
            </button>
          </div>
          {url ? <iframe src={url} title={title} className="flex-1 w-full" /> : null}
        </div>
      </ModalContent>
    </Modal>
  );
}

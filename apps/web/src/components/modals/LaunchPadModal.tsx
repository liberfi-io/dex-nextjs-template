"use client";

import { useCallback } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import {
  Button,
  ModalBody,
  ModalContent,
  ModalHeader,
  StyledModal,
  useScreen,
  XCloseIcon,
} from "@liberfi.io/ui";
import { AsyncModal, type RenderAsyncModalProps } from "@liberfi.io/ui-scaffold";
import { LaunchPadHome } from "@liberfi/ui-launchpad";

export type LaunchPadModalParams = {
  prompt?: string;
  image?: string;
};

export const LAUNCHPAD_MODAL_ID = "launchpad";

export function LaunchPadModal({ id = LAUNCHPAD_MODAL_ID }: { id?: string }) {
  return (
    <AsyncModal<LaunchPadModalParams> id={id}>
      {(modalProps) => <LaunchPadModalContent {...modalProps} />}
    </AsyncModal>
  );
}

function LaunchPadModalContent({
  params,
  isOpen,
  onOpenChange,
}: RenderAsyncModalProps<LaunchPadModalParams>) {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <StyledModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={isMobile ? "full" : "4xl"}
      isDismissable={false}
      hideCloseButton
      backdrop="blur"
      radius="lg"
    >
      <ModalContent className="w-full h-full">
        <ModalHeader className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-base font-semibold">{t("extend.launchpad.title")}</span>
          <Button
            isIconOnly
            onPress={handleClose}
            size="sm"
            className="bg-transparent min-w-6 w-6 h-6"
          >
            <XCloseIcon width={20} height={20} />
          </Button>
        </ModalHeader>
        <ModalBody className="p-4">
          <LaunchPadHome prompt={params?.prompt} image={params?.image} />
        </ModalBody>
      </ModalContent>
    </StyledModal>
  );
}

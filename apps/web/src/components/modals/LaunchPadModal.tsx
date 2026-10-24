"use client";

import { useCallback } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { ModalBody, ModalContent, StyledModal, useScreen, XCloseIcon } from "@liberfi.io/ui";
import { AsyncModal, type RenderAsyncModalProps } from "@liberfi.io/ui-scaffold";
import { LaunchPadHome } from "@liberfi.io/ui-launchpad";
import { LaunchpadUiBridge } from "../../runtime/Stage55UiBridge";
import {
  LAUNCHPAD_MODAL_ID,
  type LaunchPadModalParams,
} from "./modal-contracts";

export { LAUNCHPAD_MODAL_ID, type LaunchPadModalParams } from "./modal-contracts";

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
      classNames={{
        base: "!bg-surface-interactive !rounded-[14px] !border !border-border-control !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]",
      }}
    >
      <ModalContent>
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-text-primary">{t("launchpad.title")}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-[10px] hover:bg-surface-strong/50 text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <XCloseIcon width={18} height={18} />
          </button>
        </div>
        <ModalBody className="min-h-0 overflow-y-auto overscroll-contain !px-5 !pt-0 !pb-5">
          <LaunchpadUiBridge>
            <LaunchPadHome prompt={params?.prompt} image={params?.image} />
          </LaunchpadUiBridge>
        </ModalBody>
      </ModalContent>
    </StyledModal>
  );
}

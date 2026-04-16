"use client";

import { useCallback } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import {
  ModalContent,
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
      classNames={{
        base: "!bg-[#18181b] !rounded-[14px] !border !border-[rgba(39,39,42,1)] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]",
        body: "!p-0",
      }}
    >
      <ModalContent>
        <div>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-lg font-semibold text-white">
              {t("extend.launchpad.title")}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-[10px] hover:bg-[rgba(39,39,42,0.5)] text-zinc-400 hover:text-white transition-colors cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <XCloseIcon width={18} height={18} />
            </button>
          </div>
          <div className="px-5 pb-5">
            <LaunchPadHome prompt={params?.prompt} image={params?.image} />
          </div>
        </div>
      </ModalContent>
    </StyledModal>
  );
}

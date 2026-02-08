/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import {
  Modal as HeroUIModal,
  ModalProps as HeroUIModalProps,
  ModalContent as HeroUIModalContent,
  useDisclosure,
} from "@heroui/react";
import { Layout } from "@/types";
import { useAppSdk } from "@/hooks";
import { layoutAtom } from "@/states";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";

export type ModalProps = Partial<
  Pick<HeroUIModalProps, "scrollBehavior" | "backdrop" | "isDismissable" | "size">
> & {
  id: string;
  layoutSizes?: Partial<Record<Layout, HeroUIModalProps["size"]>>;
  layoutClassNames?: Partial<Record<Layout, HeroUIModalProps["classNames"]>>;
  header?: ReactNode;
  children: ReactNode | ((onClose: () => void, args: any) => ReactNode);
};

export function Modal({
  id,
  size = "lg",
  layoutSizes = {},
  layoutClassNames = {},
  scrollBehavior = "inside",
  backdrop = "blur",
  isDismissable = true,
  header,
  children,
}: ModalProps) {
  const appSdk = useAppSdk();

  const layout = useAtomValue(layoutAtom);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [args, setArgs] = useState<any>();

  useEffect(() => {
    const handler = (args: any) => {
      setArgs(args);
      onOpen();
    };
    appSdk.events.on(id, handler);
    return () => {
      appSdk.events.off(id, handler);
    };
  }, [onOpen, appSdk, id]);

  return (
    <HeroUIModal
      size={layoutSizes[layout] ?? size}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior={scrollBehavior}
      backdrop={backdrop}
      hideCloseButton
      isDismissable={isDismissable}
      classNames={layoutClassNames[layout]}
    >
      <HeroUIModalContent>
        {(onClose: () => void) => (
          <>
            {header && (
              <ModalHeader full={(layoutSizes[layout] ?? size) === "full"} onClose={onClose}>
                {header}
              </ModalHeader>
            )}
            <ModalBody>
              {typeof children === "function" ? children(onClose, args) : children}
            </ModalBody>
          </>
        )}
      </HeroUIModalContent>
    </HeroUIModal>
  );
}

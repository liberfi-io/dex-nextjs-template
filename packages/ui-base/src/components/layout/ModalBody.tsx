import { PropsWithChildren } from "react";
import { ModalBody as HeroModalBody } from "@heroui/react";

export function ModalBody({ children }: PropsWithChildren) {
  return <HeroModalBody className="py-0">{children}</HeroModalBody>;
}

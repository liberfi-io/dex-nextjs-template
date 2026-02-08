import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { useEffect, useState } from "react";
import { TradeBuy } from "../operations/TradeBuy";
import { TradeSell } from "../operations/TradeSell";

export type TradeOperationsModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
};

export function TradeOperationsModal({ isOpen, onOpenChange, onClose }: TradeOperationsModalProps) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const [type, setType] = useState("buy");

  // 交易结束自动关闭对话框
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (options: { method: "swap_result"; params: any }) => {
      console.info("trade modal handles swap_result", options);
      onClose();
    };
    appSdk.events.on("swap_result", handler);
    return () => {
      appSdk.events.off("swap_result", handler);
    };
  }, [onClose, appSdk]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-content2 rounded-lg">
        <ModalHeader>{t("extend.account.trade")}</ModalHeader>
        <ModalBody className="px-0">
          {/* TODO: Tab 在 Modal 下有 bug，切换 tab 会导致 modal 无法重复打开，因此这里没法直接复用 TradeOperations */}
          <div className="w-full space-y-2.5">
            <div className="px-3 w-full flex items-center">
              <div className="rounded-lg overflow-hidden flex items-center bg-content1">
                <Button
                  className="flex w-20 min-w-0 h-8 min-h-0 rounded-lg bg-transparent data-[selected=true]:bg-content3"
                  data-selected={type === "buy"}
                  disableRipple
                  disableAnimation
                  onPress={() => setType("buy")}
                >
                  {t("extend.trade.operations.buy")}
                </Button>
                <Button
                  className="flex w-20 min-w-0 h-8 min-h-0 rounded-lg bg-transparent data-[selected=true]:bg-content3"
                  data-selected={type === "sell"}
                  disableRipple
                  disableAnimation
                  onPress={() => setType("sell")}
                >
                  {t("extend.trade.operations.sell")}
                </Button>
              </div>
            </div>
            <div className="w-full px-3">
              {type === "buy" && (
                <TradeBuy classNames={{ buyWrapper: "gap-2.5", buyForm: "!bg-content1" }} />
              )}
              {type === "sell" && (
                <TradeSell
                  classNames={{
                    sellWrapper: "gap-2.5",
                    sellForm: "!bg-content1",
                  }}
                />
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

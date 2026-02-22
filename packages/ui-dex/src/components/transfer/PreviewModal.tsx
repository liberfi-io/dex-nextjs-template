import { useEffect, useState } from "react";
import { useTransferContext } from "./TransferContext";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { TokenAvatar } from "../TokenAvatar";
import { WithdrawOutlinedIcon } from "../../assets";
import { Number } from "../Number";
import { useTranslation } from "@liberfi/ui-base";
import { SOL_TOKEN_SYMBOL } from "../../libs";
import { UnsignedTransactionDto } from "@liberfi/react-backend";

export type PreviewModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function PreviewModal({ isOpen, onOpenChange }: PreviewModalProps) {
  const { t } = useTranslation();

  const {
    token,
    tokenBalance,
    amount,
    amountInUsd,
    walletAddress,
    transaction: currentTransaction,
    transactionError,
    isCreatingTransaction,
    isTransferring,
    transfer,
  } = useTransferContext();

  // 本地缓存 transaction，避免刷新时为 null
  const [transaction, setTransaction] = useState<UnsignedTransactionDto | null | undefined>();

  useEffect(() => {
    if (!isCreatingTransaction) {
      setTransaction(currentTransaction);
    }
  }, [currentTransaction, isCreatingTransaction]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-content2 rounded-lg">
        <ModalHeader>{t("extend.account.transfer_preview")}</ModalHeader>
        <ModalBody>
          <div className="w-full max-h-[70vh] overflow-y-auto py-2 flex-1 flex flex-col">
            {/* From preview */}
            <div className="mb-5">
              <div className="text-neutral flex items-center justify-between text-xs font-medium">
                {t("extend.account.transfer_from")}
              </div>
              <div className="w-full h-auto px-4 py-3 rounded-lg bg-content3 mt-3 flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3">
                  <TokenAvatar size={24} src={token?.imageUrl ?? ""} name={token?.symbol} />
                  <div className="flex flex-col justify-center items-start gap-0.5">
                    <div className="text-xs text-foreground">{token?.symbol}</div>
                    <div className="text-xxs text-neutral flex items-center gap-1">
                      <WithdrawOutlinedIcon width={12} height={12} />
                      <span>
                        <Number value={tokenBalance?.amount ?? "0"} abbreviate />
                      </span>
                      <span>{token?.symbol}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-0 flex flex-col justify-center items-end gap-0.5">
                  <div className="text-xs text-foreground">
                    <Number value={amount ?? "0"} abbreviate />
                  </div>
                  <div className="text-xxs text-neutral">
                    <Number value={amountInUsd ?? "0"} abbreviate defaultCurrencySign="$" />
                  </div>
                  <div className="text-xxs text-neutral"></div>
                </div>
              </div>
            </div>

            {/* To preview */}
            <div className="mb-5">
              <div className="text-neutral flex items-center justify-between text-xs font-medium">
                {t("extend.account.transfer_to")}
              </div>
              <div className="w-full h-auto px-4 py-3 rounded-lg bg-content3 mt-3 flex items-center gap-3 text-sm text-wrap break-all">
                {walletAddress}
              </div>
            </div>

            {/* Fee */}
            <div className="mb-5 text-neutral flex items-center justify-between text-xs font-medium">
              {t("extend.account.transfer_fee")}
              <div className="text-foreground space-x-1">
                <span>
                  <Number value={transaction?.estimatedFee ?? "0"} abbreviate />
                </span>
                <span>{SOL_TOKEN_SYMBOL}</span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            color="primary"
            className="flex rounded-lg"
            disableRipple
            isDisabled={!transaction || !!transactionError}
            isLoading={isCreatingTransaction || isTransferring}
            onPress={transfer}
          >
            {t("extend.common.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

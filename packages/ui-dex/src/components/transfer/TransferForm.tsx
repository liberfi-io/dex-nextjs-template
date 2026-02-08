import { useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import { useTransferContext } from "./TransferContext";
import { TokenAmountInput } from "./TokenAmountInput";
import { WalletAddressInput } from "./WalletAddressInput";

export type TransferFormProps = {
  onSubmit: () => void;
};

export function TransferForm({ onSubmit }: TransferFormProps) {
  const { t } = useTranslation();

  const { transaction, isCreatingTransaction, transactionError } = useTransferContext();

  return (
    <div className="px-4 pb-4 lg:pb-8">
      <TokenAmountInput />
      <WalletAddressInput />
      <Button
        fullWidth
        color="primary"
        className="flex mt-8 rounded-lg"
        disableRipple
        isDisabled={!transaction || !!transactionError}
        isLoading={isCreatingTransaction}
        onPress={onSubmit}
      >
        {t("extend.account.transfer")}
      </Button>
    </div>
  );
}

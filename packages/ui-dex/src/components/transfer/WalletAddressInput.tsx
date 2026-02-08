import clsx from "clsx";
import { Button, Input } from "@heroui/react";
import { CloseIcon, CopyIcon } from "@/assets";
import { useAuth, useTranslation } from "@liberfi/ui-base";
import { usePaste } from "@/hooks";
import { useTransferContext } from "./TransferContext";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";
import { isValidWalletAddress } from "@/libs";
import { CHAIN_ID } from "@liberfi/core";

export function WalletAddressInput() {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { setWalletAddress } = useTransferContext();

  const [inputValue, setInputValue] = useState<string>("");

  const [error, setError] = useState<string | undefined>(undefined);

  const handleWalletAddressChange = useCallback(
    (address: string) => {
      setWalletAddress(address);
      setError(undefined);

      if (!address) return;

      if (address === user?.solanaAddress) {
        setError(t("extend.account.transfer_errors.is_self"));
        return;
      }

      const isValid = isValidWalletAddress(CHAIN_ID.SOLANA, address);
      if (!isValid) {
        setError(t("extend.account.transfer_errors.invalid_wallet_address"));
      }
    },
    [setWalletAddress, t, user?.solanaAddress],
  );

  const debouncedHandleWalletAddressChange = useMemo(
    () => debounce(handleWalletAddressChange, 500),
    [handleWalletAddressChange],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedHandleWalletAddressChange(value);
    },
    [debouncedHandleWalletAddressChange, setInputValue],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setError(undefined);
    debouncedHandleWalletAddressChange("");
  }, [debouncedHandleWalletAddressChange, setInputValue, setError]);

  const { text: pasteText, paste } = usePaste();

  useEffect(() => {
    if (pasteText) {
      setInputValue(pasteText);
      debouncedHandleWalletAddressChange(pasteText);
    }
  }, [pasteText, debouncedHandleWalletAddressChange, setInputValue]);

  return (
    <div className="mt-4 space-y-3">
      <p className="text-neutral font-medium text-sm">{t("extend.account.convert_to")}</p>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={t("extend.account.transfer_placeholder")}
        classNames={{
          base: "w-full",
          inputWrapper: clsx(
            "h-10 min-h-10 rounded-lg",
            "bg-content1 data-[hover=true]:bg-content1 group-data-[focus=true]:bg-content1",
            "group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent group-data-[focus-visible=true]:ring-0",
          ),
          input: "text-sm caret-primary placeholder:text-placeholder placeholder:text-sm",
        }}
        endContent={
          <>
            {/* clear */}
            {inputValue && (
              <Button
                isIconOnly
                className={clsx("flex w-8 min-w-0 h-8 min-h-0 text-neutral bg-transparent")}
                disableRipple
                onPress={handleClear}
              >
                <CloseIcon width={10} height={10} />
              </Button>
            )}

            {/* paste */}
            {!inputValue && (
              <Button
                isIconOnly
                className={clsx("flex w-8 min-w-0 h-8 min-h-0 text-neutral bg-transparent")}
                disableRipple
                onPress={paste}
              >
                <CopyIcon width={16} height={16} />
              </Button>
            )}
          </>
        }
      />
      {error && <p className="mt-1 text-danger-500 text-xs max-sm:text-xxs">{error}</p>}
    </div>
  );
}

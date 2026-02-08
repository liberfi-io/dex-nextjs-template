import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Button, Input } from "@heroui/react";
import { CloseOutlinedIcon, CopyOutlinedIcon, usePaste, useTranslation } from "@liberfi/ui-base";

export type RedPacketCodeInputProps = {
  value?: string;
  onChange?: (text: string) => void;
};

export function RedPacketCodeInput({ value, onChange }: RedPacketCodeInputProps) {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onChange?.(value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange?.("");
  }, [onChange]);

  const { text: pasteText, paste } = usePaste();

  const handlePaste = useCallback(() => paste(), [paste]);

  useEffect(() => {
    if (pasteText) {
      // TODO extract share code from paste text
      setInputValue(pasteText);
      onChange?.(pasteText);
    }
  }, [pasteText, onChange]);

  return (
    <Input
      value={inputValue}
      onChange={handleInputChange}
      placeholder={t("extend.redpacket.home.claim_placeholder")}
      fullWidth
      classNames={{
        inputWrapper:
          "rounded-lg bg-content1 data-[hover=true]:bg-content2 group-data-[focus=true]:bg-content2",
        input: "text-sm caret-secondary placeholder:text-placeholder placeholder:text-sm",
      }}
      endContent={
        <>
          {/* clear */}
          {inputValue && (
            <Button
              isIconOnly
              className="w-8 min-w-0 h-8 min-h-0 text-neutral bg-transparent"
              disableRipple
              onPress={handleClear}
            >
              <CloseOutlinedIcon width={10} height={10} />
            </Button>
          )}

          {/* paste */}
          {!inputValue && (
            <Button
              isIconOnly
              className="w-8 min-w-0 h-8 min-h-0 text-neutral bg-transparent"
              disableRipple
              onPress={handlePaste}
            >
              <CopyOutlinedIcon width={16} height={16} />
            </Button>
          )}
        </>
      }
    />
  );
}

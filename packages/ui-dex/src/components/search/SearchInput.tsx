import { CloseIcon, CopyIcon } from "../../assets";
import { SearchIcon, useTranslation } from "@liberfi/ui-base";
import { Button, Input } from "@heroui/react";
import clsx from "clsx";
import { useTokenListContext } from "../tokens";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";
import { usePaste, useSearchHistories } from "../../hooks";

export type SearchInputProps = {
  defaultKeyword?: string;
};

export function SearchInput({ defaultKeyword }: SearchInputProps) {
  const { t } = useTranslation();

  const { setKeyword } = useTokenListContext();

  const debouncedSetKeyword = useMemo(
    () => debounce((value: string) => setKeyword(value), 500, { leading: true, trailing: true }),
    [setKeyword],
  );

  const { addHistory } = useSearchHistories();

  const debouncedAddHistory = useMemo(
    () => debounce((value: string) => addHistory(value), 500, { leading: false, trailing: true }),
    [addHistory],
  );

  const [text, setText] = useState("");

  const handleValueChange = useCallback(
    (value: string) => {
      setText(value);
      debouncedAddHistory(value);
    },
    [debouncedAddHistory, setText],
  );

  const handleClear = useCallback(() => setText(""), [setText]);

  const { text: clipboardText, paste } = usePaste();

  useEffect(() => debouncedSetKeyword(text), [text, debouncedSetKeyword]);

  useEffect(() => {
    if (clipboardText) {
      setText(clipboardText);
    }
  }, [clipboardText, setText]);

  useEffect(() => {
    if (defaultKeyword) {
      setText(defaultKeyword);
      debouncedAddHistory(defaultKeyword);
    }
  }, [defaultKeyword, debouncedAddHistory, setText]);

  return (
    <Input
      value={text}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      onValueChange={handleValueChange}
      placeholder={t("extend.header.search_placeholder")}
      classNames={{
        base: "w-full",
        inputWrapper: clsx(
          "h-8 min-h-8 rounded-full",
          "bg-content1 data-[hover=true]:bg-content1 group-data-[focus=true]:bg-content1",
          "data-[hover=true]:opacity-hover data-[focus=true]:opacity-hover",
          "group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent",
          "group-data-[focus-visible=true]:ring-0",
        ),
        input: clsx("caret-primary placeholder:text-placeholder placeholder:text-sm"),
      }}
      startContent={<SearchIcon width={18} height={18} className={clsx("text-neutral")} />}
      endContent={
        <>
          {/* clear */}
          {text && (
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
          {!text && (
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
  );
}

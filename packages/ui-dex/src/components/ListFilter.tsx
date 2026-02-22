import { FilterIcon } from "../assets/icons";
import { useTranslation } from "@liberfi/ui-base";
import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { PropsWithChildren, useCallback } from "react";

export type ListFilterProps = PropsWithChildren<{
  active?: boolean;
  onApply?: () => void;
  onClear?: () => void;
  onClose?: () => void;
}>;

export function ListFilter({
  children,
  active = false,
  onApply,
  onClear,
  onClose,
}: ListFilterProps) {
  const { t } = useTranslation();

  const { isOpen, onOpenChange, onClose: closeFilter } = useDisclosure();

  const handleApply = useCallback(() => {
    onApply?.();
    closeFilter();
  }, [onApply, closeFilter]);

  return (
    <Popover placement="bottom" onClose={onClose} isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <Button
          isIconOnly
          className={clsx(
            "flex w-4 min-w-0 h-4 min-h-0",
            "bg-transparent",
            active ? "text-bullish" : "text-neutral",
          )}
          disableRipple
        >
          <FilterIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-content2 rounded-lg p-4">
        <div className="w-[326px]">
          {children}
          <div className="mt-6 w-full flex items-center justify-center gap-2.5">
            <Button
              size="sm"
              className={clsx(
                "flex basis-[calc(25%-5px)]",
                "bg-transparent text-neutral border-1 border-content3",
              )}
              onPress={onClear}
              disableRipple
            >
              {t("extend.token_list.filters.clear")}
            </Button>
            <Button
              size="sm"
              color="primary"
              className={clsx("flex basis-[calc(75%-5px)]")}
              onPress={handleApply}
              disableRipple
            >
              {t("extend.token_list.filters.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

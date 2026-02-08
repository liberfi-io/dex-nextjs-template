import { DeleteIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import { Button, Chip } from "@heroui/react";
import clsx from "clsx";
import { useSearchHistories } from "@/hooks";

export type SearchHistoryProps = {
  className?: string;
  onSelect?: (history: string) => void;
};

export function SearchHistory({ className, onSelect }: SearchHistoryProps) {
  const { t } = useTranslation();

  const { histories, clearHistories } = useSearchHistories();

  if (histories.length === 0) {
    return <></>;
  }

  return (
    <div className={clsx("px-6 max-sm:px-4 pb-5", className)}>
      <h2 className="flex items-center justify-between">
        <span className="text-base font-medium">{t("extend.search.history")}</span>
        <Button
          isIconOnly
          className={clsx("flex w-6 min-w-6 h-6 min-h-6 text-neutral bg-transparent")}
          disableRipple
          onPress={clearHistories}
        >
          <DeleteIcon width={16} height={16} />
        </Button>
      </h2>
      <div className="flex flex-wrap gap-x-4">
        {histories.slice(0, 10).map((history) => (
          <Chip
            key={history}
            size="sm"
            variant="bordered"
            className={clsx(
              "h-6 mt-3 px-3",
              "text-neutral border-1 border-content3 cursor-pointer",
              "hover:opacity-hover",
            )}
            onClick={() => onSelect?.(history)}
          >
            {history}
          </Chip>
        ))}
      </div>
    </div>
  );
}

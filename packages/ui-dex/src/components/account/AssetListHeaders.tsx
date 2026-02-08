import clsx from "clsx";
import {
  ActionsHeader,
  BalanceHeader,
  // ContractHeader,
  PnlHeader,
  PriceHeader,
  PriceHistoryHeader,
  TokenHeader,
} from "./headers/asset";

export type AssetListHeadersProps = {
  className?: string;
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
  compact?: boolean;
};

export function AssetListHeaders({
  sort,
  onSortChange,
  compact = false,
  className,
}: AssetListHeadersProps) {
  return (
    <div
      className={clsx(
        "group w-full h-12 lg:data-[compact=false]:h-14 bg-background",
        "flex items-center justify-between lg:data-[compact=false]:gap-1",
        "lg:data-[compact=false]:bg-content1 lg:data-[compact=false]:border-b lg:data-[compact=false]:border-content3",
        "text-xs font-medium text-neutral",
        className,
      )}
      data-compact={compact}
    >
      <TokenHeader className="lg:group-data-[compact=false]:w-[200px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1" />
      <PriceHeader
        sort={sort}
        onSortChange={onSortChange}
        className="lg:group-data-[compact=false]:w-[120px] max-lg:flex-1 max-lg:hidden lg:group-data-[compact=true]:flex-1 lg:group-data-[compact=true]:hidden"
      />
      <PriceHistoryHeader className="lg:group-data-[compact=false]:w-[220px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden" />
      <BalanceHeader
        sort={sort}
        onSortChange={onSortChange}
        className="lg:group-data-[compact=false]:w-[110px] max-lg:flex-[0.7] lg:group-data-[compact=true]:flex-[0.7]"
      />
      <PnlHeader
        sort={sort}
        onSortChange={onSortChange}
        className="lg:group-data-[compact=false]:w-[110px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1"
      />
      {/* <ContractHeader className="lg:group-data-[compact=false]:w-[140px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden" /> */}
      <ActionsHeader className="lg:group-data-[compact=false]:w-[50px] max-lg:flex-[0.3] lg:group-data-[compact=true]:flex-[0.3]" />
    </div>
  );
}

import {
  ArrowDownIcon,
  ChainImage,
  NetworkIcon,
  SelectedIndicatorIcon,
  UnselectedIndicatorIcon,
} from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import { capitalize } from "@/libs";
import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { CHAIN_ID, chainSlugs } from "@liberfi/core";
import clsx from "clsx";
import { ReactNode, useCallback } from "react";

export const CHAINS = [
  CHAIN_ID.SOLANA,
  CHAIN_ID.ETHEREUM,
  CHAIN_ID.BINANCE,
  // CHAIN_ID.BASE,
  // CHAIN_ID.ARBITRUM,
  // CHAIN_ID.AVALANCHE,
  // CHAIN_ID.OPTIMISM,
  // CHAIN_ID.POLYGON,
  // CHAIN_ID.ZKSYNC_ERA,
];

export type ChainSelectProps = {
  chainId: CHAIN_ID;
  onSelect?: (chain: CHAIN_ID) => void;
  trigger?: ReactNode;
};

export function ChainSelect({ chainId, trigger, onSelect }: ChainSelectProps) {
  const { t } = useTranslation();

  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const handleSelect = useCallback(
    (chain: CHAIN_ID) => {
      onSelect?.(chain);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-end"
      classNames={{ content: "w-64 bg-content2 rounded-lg p-4" }}
    >
      <PopoverTrigger>
        {trigger ?? (
          <Button
            className="flex w-auto min-w-[110px] min-h-0 gap-1.5 justify-end p-0 bg-transparent text-xs text-neutral"
            startContent={
              chainId ? (
                <ChainImage chainId={chainId as CHAIN_ID} width={24} height={24} />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <NetworkIcon width={20} height={20} />
                </div>
              )
            }
            endContent={
              <ArrowDownIcon
                className="data-[open=true]:rotate-180 transition-transform"
                data-open={isOpen}
              />
            }
            disableRipple
          >
            {!chainId
              ? t("extend.token_list.filters.chain.universal_chains")
              : capitalize(chainSlugs[chainId as CHAIN_ID]!)}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-full flex flex-col gap-2.5">
          {CHAINS.map((chain) => (
            <ChainOption
              key={chain}
              isSelected={chainId === chain}
              label={capitalize(chainSlugs[chain as CHAIN_ID]!)}
              icon={<ChainImage chainId={chain} width={24} height={24} />}
              action={() => handleSelect(chain)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type ChainOptionProps = {
  className?: string;
  classNames?: {
    label?: string;
  };
  isSelected: boolean;
  label: string;
  icon?: ReactNode;
  action?: () => void;
};

export function ChainOption({
  isSelected,
  label,
  icon,
  action,
  className,
  classNames,
}: ChainOptionProps) {
  return (
    <div
      data-selected={isSelected}
      className={clsx(
        "w-full h-10 px-4 flex items-center gap-2 rounded-lg hover:opacity-hover cursor-pointer",
        "text-xs text-neutral data-[selected=true]:text-foreground data-[selected=true]:font-medium",
        "bg-transparent data-[selected=true]:bg-primary/20",
        "border border-content3 data-[selected=true]:border-transparent",
        className,
      )}
      onClick={action}
    >
      <div className="flex-1 flex items-center gap-2">
        {icon}
        <span className={classNames?.label}>{label}</span>
      </div>
      {isSelected && <SelectedIndicatorIcon width={18} height={18} className="text-primary" />}
      {!isSelected && <UnselectedIndicatorIcon width={18} height={18} className="text-neutral" />}
    </div>
  );
}

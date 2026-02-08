import { useCallback } from "react";
import {
  Button,
  clsx,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@liberfi.io/ui";
import { ChainAvatar } from "./chain-avatar";
import { CHAIN_ID } from "@liberfi/core";
import { getChainDisplayName } from "../../../../libs/chain";

export type ChainSelectDesktopUIProps = {
  size?: "sm" | "md" | "lg";
  candidates: CHAIN_ID[];
  chain?: CHAIN_ID;
  onSelectChain?: (chain: CHAIN_ID) => void;
  className?: string;
};

export function ChainSelectDesktopUI({
  size,
  candidates,
  chain = candidates[0],
  onSelectChain,
  className,
}: ChainSelectDesktopUIProps) {
  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const handleSelect = useCallback(
    (chain: CHAIN_ID) => {
      onSelectChain?.(chain);
      onClose();
    },
    [onSelectChain, onClose],
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-end"
      className={className}
      classNames={{ content: "w-38 bg-content1 border border-border" }}
    >
      <PopoverTrigger>
        <Button
          size={size}
          variant="bordered"
          radius="full"
          startContent={
            <ChainAvatar
              chain={chain}
              className={clsx(
                size === "sm"
                  ? "w-6 h-6"
                  : size === "md" || size === undefined
                  ? "w-7 h-7"
                  : "w-8 h-8",
              )}
            />
          }
        >
          {getChainDisplayName(chain)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 flex flex-col gap-1 p-1 rounded-md">
        {candidates.map((it) => (
          <div
            key={it}
            className={clsx(
              "w-full h-10 hover:bg-content2/80 cursor-pointer rounded-md px-3",
              "flex gap-2 items-center",
              it === chain ? "bg-content2 text-foreground" : "text-neutral",
            )}
            onClick={() => handleSelect(it)}
          >
            <ChainAvatar
              chain={it}
              className={clsx(
                size === "sm"
                  ? "w-6 h-6"
                  : size === "md" || size === undefined
                  ? "w-7 h-7"
                  : "w-8 h-8",
              )}
            />
            {getChainDisplayName(it)}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

import { Button, clsx } from "@liberfi.io/ui";
import { ChainAvatar } from "./chain-avatar";
import { CHAIN_ID } from "@liberfi/core";

export type ChainSelectMobileUIProps = {
  size?: "sm" | "md" | "lg";
  candidates: CHAIN_ID[];
  chain?: CHAIN_ID;
  onSelectChain?: (chain: CHAIN_ID) => void;
  className?: string;
};

export function ChainSelectMobileUI({
  size,
  candidates,
  chain = CHAIN_ID.SOLANA,
  onSelectChain,
  className,
}: ChainSelectMobileUIProps) {
  return (
    <div className={clsx("flex items-center gap-1", className)}>
      {candidates.map((it) => (
        <Button
          isIconOnly
          radius="full"
          className={clsx(
            "min-w-0 min-h-0",
            size === "sm"
              ? "w-6 h-6"
              : size === "md" || size === undefined
                ? "w-7 h-7"
                : "w-8 h-8",
            it === chain
              ? "bg-content1 scale-110 hover:opacity-100"
              : "bg-transparent scale-90 opacity-50 hover:opacity-100",
          )}
          key={it}
          onPress={() => onSelectChain?.(it)}
        >
          <ChainAvatar
            chain={it}
            className={clsx(
              size === "sm"
                ? "w-5 h-5"
                : size === "md" || size === undefined
                  ? "w-6 h-6"
                  : "w-7 h-7",
            )}
          />
        </Button>
      ))}
    </div>
  );
}

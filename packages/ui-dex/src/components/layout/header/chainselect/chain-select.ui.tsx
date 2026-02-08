import { useScreen } from "@liberfi.io/ui";
import { ChainSelectDesktopUI } from "./chain-select.desktop.ui";
import { ChainSelectMobileUI } from "./chain-select.mobile.ui";
import { CHAIN_ID } from "@liberfi/core";

const DEFAULT_CANDIDATES = [CHAIN_ID.SOLANA, CHAIN_ID.ETHEREUM, CHAIN_ID.BINANCE];

export type ChainSelectUIProps = {
  size?: "sm" | "md" | "lg";
  chain?: CHAIN_ID;
  candidates?: CHAIN_ID[];
  onSelectChain?: (chain: CHAIN_ID) => void;
  className?: string;
};

export function ChainSelectUI({
  size,
  chain = CHAIN_ID.SOLANA,
  candidates = DEFAULT_CANDIDATES,
  onSelectChain,
  className,
}: ChainSelectUIProps) {
  const { isMobile } = useScreen();

  if (isMobile) {
    return (
      <ChainSelectMobileUI
        size={size}
        chain={chain}
        onSelectChain={onSelectChain}
        candidates={candidates}
        className={className}
      />
    );
  } else {
    return (
      <ChainSelectDesktopUI
        size={size}
        chain={chain}
        onSelectChain={onSelectChain}
        candidates={candidates}
        className={className}
      />
    );
  }
}

import { TokenListProvider } from "../tokens";
import { SearchHeader } from "./SearchHeader";
import { useState } from "react";
import { SearchContent } from "./SearchContent";

type SearchProps = {
  onClose?: () => void;
  onSelect?: (chain: string, tokenAddress: string) => void;
};

export function Search({ onClose, onSelect }: SearchProps) {
  const [defaultKeyword, setDefaultKeyword] = useState("");

  return (
    <TokenListProvider>
      <SearchHeader onClose={onClose} defaultKeyword={defaultKeyword} />
      <SearchContent onSelectHistory={setDefaultKeyword} onSelectToken={onSelect} />
    </TokenListProvider>
  );
}

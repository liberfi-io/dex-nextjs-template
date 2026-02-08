import { useTokenListContext } from "../tokens";
import { useEffect } from "react";
import { SearchHistory } from "./SearchHistory";
import { SearchTokenList } from "./SearchTokenList";
import clsx from "clsx";
import { SearchResultTokenList } from "./SearchResultTokenList";

export type SearchContentProps = {
  className?: string;
  onSelectHistory?: (keyword: string) => void;
  onSelectToken?: (chain: string, tokenAddress: string) => void;
};

export function SearchContent({ onSelectToken, onSelectHistory, className }: SearchContentProps) {
  const { keyword } = useTokenListContext();

  useEffect(() => {
    onSelectHistory?.("");
  }, [keyword, onSelectHistory]);

  return (
    <div className={clsx("w-full h-[calc(100%-var(--header-height))] flex flex-col", className)}>
      {!keyword && (
        <>
          <SearchHistory className="flex-none" onSelect={onSelectHistory} />
          <SearchTokenList className="flex-1" onSelectToken={onSelectToken} />
        </>
      )}

      {keyword && <SearchResultTokenList className="flex-1" onSelectToken={onSelectToken} />}
    </div>
  );
}

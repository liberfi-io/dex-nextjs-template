import { useTokenListContext } from "../tokens";
import { SearchDiscoverTokenListHeaders } from "./SearchDiscoverTokenListHeaders";
import { SearchDiscoverTrendingTokenList } from "./SearchDiscoverTrendingTokenList";
import { SearchDiscoverNewTokenList } from "./SearchDiscoverNewTokenList";

export type SearchDiscoverTokenListProps = {
  onSelectToken?: (chain: string, tokenAddress: string) => void;
  containerHeight: number;
};

export function SearchDiscoverTokenList({
  onSelectToken,
  containerHeight,
}: SearchDiscoverTokenListProps) {
  const { subType } = useTokenListContext();
  return (
    <>
      <SearchDiscoverTokenListHeaders />
      {subType === "trending" && (
        <SearchDiscoverTrendingTokenList
          containerHeight={containerHeight - 56}
          onSelectToken={onSelectToken}
        />
      )}
      {subType === "new" && (
        <SearchDiscoverNewTokenList
          containerHeight={containerHeight - 56}
          onSelectToken={onSelectToken}
        />
      )}
    </>
  );
}

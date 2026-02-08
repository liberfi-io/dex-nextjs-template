import clsx from "clsx";
import { SearchDiscoverTokenList } from "./SearchDiscoverTokenList";
import { SearchTokenListTap } from "./SearchTokenListTap";
import { useMeasure } from "react-use";
import { useTokenListContext } from "../tokens";
import { SearchFavoriteTokenList } from "./SearchFavoriteTokenList";
import { SearchViewListTokenList } from "./SearchViewListTokenList";

export type SearchTokenListProps = {
  className?: string;
  onSelectToken?: (chain: string, tokenAddress: string) => void;
};

export function SearchTokenList({ onSelectToken, className }: SearchTokenListProps) {
  const [ref, { height }] = useMeasure<HTMLDivElement>();
  const { type } = useTokenListContext();
  return (
    <div className={clsx("w-full px-3 max-sm:px-1 overflow-auto", className)} ref={ref}>
      <SearchTokenListTap />
      {type === "discover" && (
        <SearchDiscoverTokenList containerHeight={height - 80} onSelectToken={onSelectToken} />
      )}
      {type === "favorite" && (
        <SearchFavoriteTokenList containerHeight={height - 80} onSelectToken={onSelectToken} />
      )}
      {type === "views" && (
        <SearchViewListTokenList containerHeight={height - 80} onSelectToken={onSelectToken} />
      )}
    </div>
  );
}

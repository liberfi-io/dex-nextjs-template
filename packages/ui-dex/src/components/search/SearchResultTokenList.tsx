import { useTokenListContext } from "../tokens";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAddTokenToCollectionMutation,
  useRemoveTokenFromCollectionMutation,
  useTokenAddressesInCollectionQuery,
} from "@liberfi/react-backend";
import { ListError } from "../ListError";
import { ListEmptyData } from "../ListEmptyData";
import { Listbox, ListboxItem } from "@heroui/react";
import clsx from "clsx";
import { useMeasure } from "react-use";
import { SearchResultTokenListHeaders } from "./SearchResultTokenListHeaders";
import { SearchDiscoverTokenListSkeleton } from "./SearchDiscoverTokenListSkeleton";
import { SearchParams } from "@chainstream-io/sdk";
import { tokenSort } from "../../libs";
import { SearchDiscoverTokenListItem } from "./SearchDiscoverTokenListItem";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth } from "@liberfi/ui-base";
import { useSearchTokensQuery, UseSearchTokensQueryParams } from "@liberfi/react-dex";

export type SearchResultTokenListProps = {
  onSelectToken?: (chain: string, tokenAddress: string) => void;
  className?: string;
};

export function SearchResultTokenList({ onSelectToken, className }: SearchResultTokenListProps) {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  return (
    <div className={clsx("w-full px-3 max-sm:px-1 overflow-auto", className)} ref={ref}>
      <SearchResultTokenListHeaders />
      <SearchResultTokenListContent containerHeight={height - 56} onSelectToken={onSelectToken} />
    </div>
  );
}

type SearchResultTokenListContentProps = {
  containerHeight: number;
  onSelectToken?: (chain: string, tokenAddress: string) => void;
};

const searchSortFields: Record<string, SearchParams["sortBy"]> = {
  ["marketData.priceInUsd"]: "priceInUsd",
  ["marketData.marketCapInUsd"]: "marketCapInUsd",
  ["marketData.tvlInUsd"]: "liquidityInUsd",
  ["tokenCreatedAt"]: "tokenCreatedAt",
};

function SearchResultTokenListContent({
  containerHeight,
  onSelectToken,
}: SearchResultTokenListContentProps) {
  const { status } = useAuth();

  const { keyword, sort, timeframe } = useTokenListContext();

  const { chain } = useCurrentChain();

  const param = useMemo(() => {
    const sortRequest = sort ? tokenSort(sort, timeframe) : undefined;
    const sortBy = sortRequest?.sortBy ? searchSortFields[sortRequest.sortBy] : undefined;
    const sortDirection =
      sortBy && sortRequest?.sortDirection ? sortRequest.sortDirection.toLowerCase() : undefined;

    return {
      chains: [chain],
      q: keyword,
      sortBy,
      sort: sortDirection,
      limit: 100,
    } as UseSearchTokensQueryParams;
  }, [keyword, sort, timeframe, chain]);

  const { data: searchResult, isLoading, isFetching, error } = useSearchTokensQuery(param);

  const { data: viewTokenAddressees } = useTokenAddressesInCollectionQuery("views", {
    enabled: status === "authenticated",
  });

  const [viewList, setViewList] = useState<Record<string, boolean>>({});

  const { mutateAsync: addViewToken } = useAddTokenToCollectionMutation();

  const { mutateAsync: removeViewToken } = useRemoveTokenFromCollectionMutation();

  useEffect(() => {
    if (viewTokenAddressees) {
      setViewList(viewTokenAddressees.reduce((acc, it) => ({ ...acc, [it]: true }), {}));
    }
  }, [viewTokenAddressees]);

  const handleAddViewToken = useCallback(
    async (address: string) => {
      setViewList((prev) => ({ ...prev, [address]: true }));
      await addViewToken({
        tokenAddress: address,
        type: "views",
      });
    },
    [addViewToken, setViewList],
  );

  const handleRemoveViewToken = useCallback(
    async (address: string) => {
      setViewList((prev) => ({ ...prev, [address]: false }));
      await removeViewToken({
        tokenAddress: address,
        type: "views",
      });
    },
    [removeViewToken, setViewList],
  );

  if (error) {
    return <ListError />;
  }

  if (isLoading || isFetching) {
    return <SearchDiscoverTokenListSkeleton />;
  }

  if (!searchResult || !searchResult.data || searchResult.data.length === 0) {
    return <ListEmptyData className="lg:py-8" />;
  }

  return (
    <Listbox
      className="w-full overflow-x-hidden"
      classNames={{ base: "p-0", list: "gap-0" }}
      isVirtualized
      virtualization={{ itemHeight: 56, maxListboxHeight: containerHeight }}
    >
      {searchResult.data.map((it) => (
        <ListboxItem
          key={it.address}
          className={clsx(
            "rounded-none p-0",
            "data-[hover=true]:bg-transparent",
            "data-[selectable=true]:focus:bg-transparent",
          )}
          onPress={() => onSelectToken?.(it.chain, it.address)}
        >
          <SearchDiscoverTokenListItem
            token={it}
            isViewed={viewList[it.address]}
            onView={handleAddViewToken}
            onUnview={handleRemoveViewToken}
          />
        </ListboxItem>
      ))}
    </Listbox>
  );
}

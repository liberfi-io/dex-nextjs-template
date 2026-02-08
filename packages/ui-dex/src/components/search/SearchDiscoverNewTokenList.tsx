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
import { SearchDiscoverTokenListSkeleton } from "./SearchDiscoverTokenListSkeleton";
import { tokenFilters, tokenSort } from "@/libs";
import { SearchDiscoverTokenListItem } from "./SearchDiscoverTokenListItem";
import { useAtomValue } from "jotai";
import { chainAtom, useAuth } from "@liberfi/ui-base";
import { useNewTokensQuery } from "@liberfi/react-dex";

export type SearchDiscoverNewTokenListProps = {
  onSelectToken?: (chain: string, tokenAddress: string) => void;
  containerHeight: number;
};

export function SearchDiscoverNewTokenList({
  onSelectToken,
  containerHeight,
}: SearchDiscoverNewTokenListProps) {
  const { status } = useAuth();

  const { timeframe, filters, sort } = useTokenListContext();

  const chain = useAtomValue(chainAtom);

  const params = useMemo(() => {
    const sortRequest = sort ? tokenSort(sort, timeframe) : undefined;
    const filterRequest = filters ? tokenFilters(filters, timeframe) : undefined;
    return {
      chain,
      duration: timeframe,
      sortBy: sortRequest?.sortBy,
      sortDirection: sortRequest?.sortDirection,
      filterBy: filterRequest?.filterBy,
    };
  }, [timeframe, filters, sort, chain]);

  const { data: tokens, isLoading, isFetching, error } = useNewTokensQuery(params);

  const { data: viewTokenAddressees } = useTokenAddressesInCollectionQuery("views", {
    enabled: status === "authenticated",
  });

  const { mutateAsync: addViewToken } = useAddTokenToCollectionMutation();

  const { mutateAsync: removeViewToken } = useRemoveTokenFromCollectionMutation();

  const [viewList, setViewList] = useState<Record<string, boolean>>({});

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

  if (!tokens || tokens.length === 0) {
    return <ListEmptyData className="lg:py-8" />;
  }

  return (
    <Listbox
      className="w-full overflow-x-hidden"
      classNames={{ base: "p-0", list: "gap-0" }}
      isVirtualized
      virtualization={{ itemHeight: 56, maxListboxHeight: containerHeight }}
    >
      {tokens.map((it) => (
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

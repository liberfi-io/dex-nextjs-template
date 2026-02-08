import { useTokenHoldersQuery } from "@liberfi/react-dex";
import { Token, TokenHolder } from "@chainstream-io/sdk";
import { ChainAddress } from "@/components/ChainAddress";
import { formatPercentage } from "@/libs";
import { Skeleton } from "@heroui/react";
import { Number } from "@/components/Number";
import { Virtuoso } from "react-virtuoso";
import { CHAIN_ID, chainIdBySlug } from "@liberfi/core";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { layoutAtom } from "@liberfi/ui-base";
import { tokenInfoAtom } from "@/states";

export function HoldersList() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <Skeletons />;
}

function Content({ token }: { token: Token }) {
  const layout = useAtomValue(layoutAtom);

  const chain = useMemo(() => chainIdBySlug(token.chain) ?? CHAIN_ID.SOLANA, [token.chain]);

  const { data: holdersPage, isLoading } = useTokenHoldersQuery({
    chain,
    tokenAddress: token.address,
  });

  if (isLoading || !holdersPage) {
    return <Skeletons />;
  }

  return (
    <div className="md:flex-1 w-full py-1.5">
      <Virtuoso
        fixedItemHeight={32}
        className="md:h-full scrollbar-hide"
        data={holdersPage.data}
        itemContent={(_, holder) => <HolderItem holder={holder} />}
        useWindowScroll={layout === "mobile"}
      />
    </div>
  );
}

type HolderItemProps = {
  holder: TokenHolder;
};

function HolderItem({ holder }: HolderItemProps) {
  return (
    <div className="w-full h-8 flex items-center justify-between text-xs">
      <ChainAddress
        address={holder.walletAddress}
        className="flex-none text-neutral hover:opacity-80"
      />
      <div className="flex-1 flex justify-end gap-2 overflow-hidden truncate text-ellipsis whitespace-nowrap">
        <span className="text-neutral">{formatPercentage(holder.percentage, 1)}</span>
        <span className="text-neutral">
          <Number value={holder.amountInUsd} abbreviate defaultCurrencySign="$" />
        </span>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="md:flex-1 w-full py-1.5">
      {[...Array(20)].map((_, index) => (
        <div key={index} className="w-ful h-8 flex items-center justify-center">
          <Skeleton className="w-full h-4 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

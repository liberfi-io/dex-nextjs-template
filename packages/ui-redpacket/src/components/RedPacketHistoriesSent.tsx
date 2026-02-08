import { chainAtom, useAuth } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useWalletRedPacketsQuery } from "@liberfi/react-redpacket";
import { useMemo } from "react";
import { useTokensQuery } from "@liberfi/react-dex";
import { keyBy } from "lodash-es";
import { ListEmptyData } from "@liberfi/ui-dex/dist/components/ListEmptyData";
import { Virtuoso } from "react-virtuoso";
import { RedPacketHistory, RedPacketHistoryProps } from "./RedPacketHistory";
import { Skeleton } from "@heroui/react";

export function RedPacketHistoriesSent() {
  const chain = useAtomValue(chainAtom);

  const { user } = useAuth();

  const { data: redPacketsPage, isLoading: isLoadingRedPackets } = useWalletRedPacketsQuery(
    { address: user?.solanaAddress ?? "" },
    { enabled: !!user?.solanaAddress },
  );

  const mintAddresses = useMemo(
    () => redPacketsPage?.records?.map((redPacket) => redPacket.mint) ?? [],
    [redPacketsPage],
  );

  const { data: tokens, isLoading: isLoadingTokens } = useTokensQuery(
    { chain, tokenAddresses: mintAddresses },
    { enabled: mintAddresses.length > 0 },
  );

  const tokensMap = useMemo(() => keyBy(tokens ?? [], "address"), [tokens]);

  const redPackets = useMemo<RedPacketHistoryProps[]>(
    () =>
      redPacketsPage?.records?.map((redPacket) => ({
        redPacket,
        token: tokensMap[redPacket.mint],
      })) ?? [],
    [redPacketsPage, tokensMap],
  );

  if (!user?.solanaAddress) {
    // TODO: redirect to login
    return <Skeletons />;
  }

  if (isLoadingRedPackets || isLoadingTokens) {
    return <Skeletons />;
  }

  if (redPackets.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Virtuoso
      fixedItemHeight={88}
      data={redPackets}
      itemContent={(_, { redPacket, token }) => (
        <RedPacketHistory redPacket={redPacket} token={token} />
      )}
    />
  );
}

function Skeletons() {
  return (
    <div className="w-full flex flex-col">
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
    </div>
  );
}

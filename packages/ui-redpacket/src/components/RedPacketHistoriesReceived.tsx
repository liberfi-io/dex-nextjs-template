import { useTokensQuery } from "@liberfi/react-dex";
import { useWalletClaimsQuery } from "@liberfi/react-redpacket";
import { chainAtom, useAuth } from "@liberfi/ui-base";
import { ListEmptyData } from "@liberfi/ui-dex/dist/components/ListEmptyData";
import { useAtomValue } from "jotai";
import { keyBy } from "lodash-es";
import { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { RedPacketClaimHistory, RedPacketClaimHistoryProps } from "./RedPacketClaimHistory";
import { Skeleton } from "@heroui/react";

export function RedPacketHistoriesReceived() {
  const chain = useAtomValue(chainAtom);

  const { user } = useAuth();

  const { data: claimsPage, isLoading: isLoadingClaims } = useWalletClaimsQuery(
    { address: user?.solanaAddress ?? "" },
    { enabled: !!user?.solanaAddress },
  );

  const mintAddresses = useMemo(
    () => claimsPage?.records?.map((claim) => claim.mint) ?? [],
    [claimsPage],
  );

  const { data: tokens, isLoading: isLoadingTokens } = useTokensQuery(
    { chain, tokenAddresses: mintAddresses },
    { enabled: mintAddresses.length > 0 },
  );

  const tokensMap = useMemo(() => keyBy(tokens ?? [], "address"), [tokens]);

  const claims = useMemo<RedPacketClaimHistoryProps[]>(
    () =>
      claimsPage?.records?.map((claim) => ({
        claim,
        token: tokensMap[claim.mint],
      })) ?? [],
    [claimsPage, tokensMap],
  );

  if (!user?.solanaAddress) {
    // TODO: redirect to login
    return <Skeletons />;
  }

  if (isLoadingClaims || isLoadingTokens || !tokens) {
    return <Skeletons />;
  }

  if (claims.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Virtuoso
      fixedItemHeight={88}
      data={claims}
      itemContent={(_, { claim, token }) => <RedPacketClaimHistory claim={claim} token={token} />}
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

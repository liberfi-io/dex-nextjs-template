import { PropsWithChildren, useCallback, useMemo } from "react";
import { Button, Link, Skeleton } from "@heroui/react";
import { ListEmptyData } from "@liberfi/ui-dex/components/ListEmptyData";
import { useRedPacketClaimsQuery } from "@liberfi/react-redpacket";
import {
  BackwardOutlinedIcon,
  chainAtom,
  ExternalLinkOutlinedIcon,
  useAuth,
  useTranslation,
} from "@liberfi/ui-base";
import { RedPacketClaimDTO, Token } from "@chainstream-io/sdk";
import { formatShortAddress } from "@liberfi/ui-dex/libs/format";
import { useTokenQuery } from "@liberfi/react-dex";
import { useAtomValue } from "jotai";
import { TokenAvatar } from "@liberfi/ui-dex/components/TokenAvatar";
import { BigNumber } from "bignumber.js";
import { chainTxExplorer } from "@liberfi/core";

export type RedPacketClaimsProps = {
  redPacketId: string;
  onNavigateBack?: () => void;
};

export function RedPacketClaims({ redPacketId, onNavigateBack }: RedPacketClaimsProps) {
  const chain = useAtomValue(chainAtom);

  const { data: claimsPage, isLoading: isLoadingClaims } = useRedPacketClaimsQuery({ redPacketId });

  const { data: token, isLoading: isLoadingToken } = useTokenQuery(
    chain,
    claimsPage?.records?.[0]?.mint ?? "",
    { enabled: !!claimsPage?.records && claimsPage.records.length > 0 },
  );

  const handleBack = useCallback(() => onNavigateBack?.(), [onNavigateBack]);

  if (isLoadingClaims || isLoadingToken) {
    return <Skeletons onBack={handleBack} />;
  }

  if (!claimsPage?.records || claimsPage.records.length === 0 || !token) {
    return (
      <Wrapper>
        <Header onBack={handleBack} />
        <ListEmptyData />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header onBack={handleBack} />
      <div className="lg:mt-4 h-full overflow-y-auto">
        {claimsPage.records.map((claim) => (
          <Item key={`${claim.claimer}-${claim.claimedAt}`} claim={claim} token={token} />
        ))}
      </div>
    </Wrapper>
  );
}

function Item({ claim, token }: { claim: RedPacketClaimDTO; token: Token }) {
  const { t } = useTranslation();

  const chain = useAtomValue(chainAtom);

  const { user } = useAuth();

  const self = useMemo(
    () => user?.solanaAddress === claim.claimer,
    [user?.solanaAddress, claim.claimer],
  );

  const amount = useMemo(
    () => new BigNumber(claim.amount).shiftedBy(-(token.decimals ?? 0)).toString(),
    [claim.amount, token.decimals],
  );

  return (
    <div className="w-full h-[88px] py-2">
      <div className="w-full h-full bg-content2 rounded-lg px-4 py-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs">
            {self ? t("extend.redpacket.claims.self") : formatShortAddress(claim.claimer)}
          </p>
          <p className="text-xs text-neutral">{new Date(claim.claimedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol} size={24} />
            <p className="text-xs space-x-1">
              <span>{amount}</span>
              <span className="text-neutral">{token.symbol}</span>
            </p>
          </div>
          <Button
            isIconOnly
            className="bg-transparent w-6 h-6 min-w-0 min-h-0"
            as={Link}
            href={chainTxExplorer(chain, claim.txHash)}
            target="_blank"
          >
            <ExternalLinkOutlinedIcon width={12} height={12} className="text-neutral" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <div className="w-full h-full flex flex-col px-6 py-4 max-lg:px-4 max-lg:py-0">{children}</div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex-0 h-8 max-lg:h-[var(--header-height)] max-lg:pb-2 flex justify-between items-center">
      <div className="flex items-center">
        {/* go back */}
        <Button
          isIconOnly
          className="w-8 min-w-0 h-8 min-h-0 rounded bg-transparent lg:hidden"
          onPress={onBack}
          disableRipple
        >
          <BackwardOutlinedIcon />
        </Button>
        {/* title */}
        <h1 className="text-lg font-medium">{t("extend.redpacket.claims.title")}</h1>
      </div>
    </div>
  );
}

function Skeletons({ onBack }: { onBack: () => void }) {
  return (
    <Wrapper>
      {/* header */}
      <Header onBack={onBack} />
      <div className="lg:mt-4 py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
      <div className="py-2 w-full h-[88px]">
        <Skeleton className="rounded-lg w-full h-full" />
      </div>
    </Wrapper>
  );
}

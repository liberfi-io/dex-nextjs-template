import { AppRoute } from "../../libs";
import { layoutAtom, useAuthenticatedCallback, useRouter } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";
import clsx from "clsx";
import { MouseEvent, useCallback } from "react";
import {
  AgeField,
  CompositeMobileField,
  ContractField,
  HoldersField,
  MarketCapField,
  PriceField,
  PriceMobileField,
  SocialMediaField,
  TokenField,
  ViewListField,
  ViewListMobileField,
  VolumeField,
} from "./fields";
import { useAtomValue } from "jotai";

export type DiscoverTokenListItemProps = {
  token: Token;
  isViewed: boolean;
  onView: (address: string) => void;
  onUnview: (address: string) => void;
};

export function DiscoverTokenListItem({
  token,
  isViewed,
  onView,
  onUnview,
}: DiscoverTokenListItemProps) {
  const layout = useAtomValue(layoutAtom);

  const { navigate } = useRouter();

  const onToggleViewList = useAuthenticatedCallback(() => {
    if (isViewed) {
      onUnview(token.address);
    } else {
      onView(token.address);
    }
  }, [isViewed, onUnview, onView, token.address]);

  const onSelectToken = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`${AppRoute.trade}/${token.chain}/${token.address}`);
    },
    [navigate, token.address, token.chain],
  );

  return (
    <div
      className={clsx(
        "w-full h-14 flex items-center justify-between lg:gap-1",
        "hover:cursor-pointer hover:bg-content1 lg:hover:bg-content3 rounded-lg",
      )}
      onClick={onSelectToken}
    >
      {layout === "desktop" && (
        <>
          <ViewListField isViewed={isViewed} onAction={onToggleViewList} token={token} />
          <TokenField token={token} />
          <PriceField token={token} />
          <MarketCapField token={token} />
          <HoldersField token={token} />
          <VolumeField token={token} />
          <ContractField token={token} className="max-xl:hidden" />
          <AgeField token={token} className="max-xl:hidden" />
          <SocialMediaField token={token} className="max-xl:hidden" />
        </>
      )}

      {layout !== "desktop" && (
        <>
          <CompositeMobileField token={token} />
          <PriceMobileField token={token} />
          <ViewListMobileField isViewed={isViewed} onAction={onToggleViewList} token={token} />
        </>
      )}
    </div>
  );
}

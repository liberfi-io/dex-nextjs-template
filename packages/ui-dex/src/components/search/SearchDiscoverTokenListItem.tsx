import { Token } from "@chainstream-io/sdk";
import { CompositeMobileField, PriceMobileField, ViewListMobileField } from "../tokens";
import clsx from "clsx";
import { useAuthenticatedCallback } from "@liberfi/ui-base";

export type SearchDiscoverTokenListItemProps = {
  token: Token;
  isViewed: boolean;
  onView: (assetId: string) => void;
  onUnview: (assetId: string) => void;
};

export function SearchDiscoverTokenListItem({
  token,
  isViewed,
  onView,
  onUnview,
}: SearchDiscoverTokenListItemProps) {
  const onToggleViewList = useAuthenticatedCallback(() => {
    if (isViewed) {
      onUnview(token.address);
    } else {
      onView(token.address);
    }
  }, [isViewed, onUnview, onView, token.address]);

  return (
    <div
      className={clsx(
        "w-full h-14 px-3 flex items-center justify-between",
        "hover:cursor-pointer hover:bg-content1 lg:hover:bg-content3 rounded-lg",
      )}
    >
      <CompositeMobileField token={token} />
      <PriceMobileField token={token} />
      <ViewListMobileField isViewed={isViewed} onAction={onToggleViewList} token={token} />
    </div>
  );
}

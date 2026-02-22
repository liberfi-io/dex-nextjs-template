import { FavoriteFilledIcon, FavoriteOutlinedIcon, ShareIcon } from "../../../assets";
import { ChainAddress } from "../../ChainAddress";
import { TokenAvatar } from "../../TokenAvatar";
import { Button, Skeleton } from "@heroui/react";
import { useTradeDataContext } from "../providers";
import { tokenInfoAtom } from "../../../states";
import { useAtomValue } from "jotai";

export function TradeTokenBasicInfo() {
  const { isFavorite, toggleFavorite } = useTradeDataContext();

  const token = useAtomValue(tokenInfoAtom);

  if (!token) {
    return <Skeletons />;
  }

  return (
    <div className="max-lg:hidden flex-none w-[300px] h-full pl-4 pr-2.5 bg-content1 flex items-center gap-2.5">
      {/* token info */}
      <div className="flex-1 h-full flex items-center gap-2.5 overflow-hidden">
        {/* avatar */}
        <TokenAvatar
          className="flex-none"
          src={token?.imageUrl ?? ""}
          name={token?.symbol}
          size={32}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* name */}
          <span className="text-foreground text-sm overflow-hidden text-ellipsis whitespace-nowrap">
            {token?.symbol}
          </span>
          {/* address */}
          <ChainAddress address={token?.address ?? ""} className="text-xs text-neutral" />
        </div>
      </div>

      {/* actions */}
      <div className="flex-none flex items-center gap-2">
        {/* favorite */}
        <Button
          isIconOnly
          className="flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-neutral hover:text-foreground"
          disableRipple
          onPress={toggleFavorite}
        >
          {isFavorite ? (
            <FavoriteFilledIcon width={20} height={20} />
          ) : (
            <FavoriteOutlinedIcon width={20} height={20} />
          )}
        </Button>

        {/* share */}
        <Button
          isIconOnly
          className="flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-neutral hover:text-foreground"
          disableRipple
        >
          <ShareIcon width={20} height={20} />
        </Button>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="max-lg:hidden flex-none w-[300px] h-full pl-4 pr-2.5 bg-content1 flex items-center">
      <Skeleton className="w-full h-8 rounded-lg" />
    </div>
  );
}

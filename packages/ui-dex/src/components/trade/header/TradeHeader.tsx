import { ArrowLeftIcon, FavoriteFilledIcon, FavoriteOutlinedIcon, ShareIcon } from "@/assets";
import { ChainAddress } from "@/components/ChainAddress";
import { TokenAvatar } from "@/components/TokenAvatar";
import { SearchIcon, useAppSdk, useRouter } from "@liberfi/ui-base";
import { Button, Skeleton } from "@heroui/react";
import { useCallback, useMemo } from "react";
import { useTradeDataContext } from "../providers";
import { AppRoute } from "@/libs";
import { tokenInfoAtom } from "@/states";
import { useAtomValue } from "jotai";

export function TradeHeader() {
  const { navigate } = useRouter();

  const appSdk = useAppSdk();

  const handleBack = useCallback(() => navigate(AppRoute.home), [navigate]);

  const handleSearch = useCallback(() => appSdk.events.emit("search:open"), [appSdk]);

  const { isFavorite, toggleFavorite } = useTradeDataContext();

  const token = useAtomValue(tokenInfoAtom);

  const isReady = useMemo(() => !!token, [token]);

  return (
    <div className="z-20 flex-none w-full h-14 px-4 sticky top-0 bg-background flex items-center justify-between gap-4 lg:hidden">
      <div className="flex-1 flex items-center gap-2.5 overflow-hidden">
        {/* Back button */}
        <Button
          isIconOnly
          className="flex flex-none w-6 min-w-0 h-6 min-h-0 bg-transparent"
          disableRipple
          onPress={handleBack}
        >
          <ArrowLeftIcon width={24} height={24} className="text-neutral" />
        </Button>

        {/* Token title */}
        <div className="grow-0 shrink h-9 px-2.5 flex items-center gap-2.5 bg-content1 rounded-full overflow-hidden">
          {/* avatar */}
          <Skeleton className="flex-none w-6 h-6 rounded-full" isLoaded={isReady}>
            <TokenAvatar size={24} src={token?.imageUrl ?? ""} name={token?.symbol} />
          </Skeleton>

          {/* name */}
          <Skeleton className="w-16 h-5 rounded-lg" isLoaded={isReady}>
            <div className="grow-0 shrink text-sm font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
              {token?.symbol}
            </div>
          </Skeleton>

          {/* search tokens */}
          <Button
            isIconOnly
            className="flex flex-none w-[18px] min-w-0 h-[18px] min-h-0 bg-transparent"
            disableRipple
            onPress={handleSearch}
          >
            <SearchIcon width={18} height={18} className="text-neutral" />
          </Button>
        </div>

        {/* token address */}
        {isReady && (
          <ChainAddress address={token?.address ?? ""} className="flex-none text-xs text-neutral" />
        )}
      </div>

      <div className="flex-none flex justify-end items-center gap-2.5">
        {/* Favorite */}
        <Button
          isIconOnly
          className="flex w-6 min-w-0 h-6 min-h-0 bg-transparent max-md:hidden text-neutral hover:text-foreground"
          disableRipple
          onPress={toggleFavorite}
        >
          {isFavorite ? (
            <FavoriteFilledIcon width={24} height={24} />
          ) : (
            <FavoriteOutlinedIcon width={24} height={24} />
          )}
        </Button>

        {/* Share */}
        <Button
          isIconOnly
          className="flex w-6 min-w-0 h-6 min-h-0 bg-transparent text-neutral hover:text-foreground"
          disableRipple
        >
          <ShareIcon width={24} height={24} />
        </Button>
      </div>
    </div>
  );
}

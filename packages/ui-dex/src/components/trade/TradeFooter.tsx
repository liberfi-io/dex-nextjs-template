import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  FavoriteFilledIcon,
  FavoriteOutlinedIcon,
  TradeOutlinedIcon,
} from "../../assets";
import {
  Modal,
  useAppSdk,
  useAuth,
  useAuthenticatedCallback,
  useRouter,
  useTranslation,
} from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useTradeDataContext } from "./providers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { uniqBy } from "lodash-es";
import { useRemoveTokenFromCollectionMutation } from "@liberfi/react-backend";
import { AppRoute } from "../../libs";
import { tokenInfoAtom } from "../../states";
import { useAtomValue } from "jotai";
import { InstantTrade } from "./instant_trade";

export function TradeFooter() {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const { navigate } = useRouter();

  const { user } = useAuth();

  const token = useAtomValue(tokenInfoAtom);

  const { viewTokens, isFavorite, toggleFavorite } = useTradeDataContext();

  // 删除时 UI 需要立刻反馈，不能等 viewTokens refetch 再刷新，所以需要记录正在删除的 token
  const [removingTokens, setRemovingTokens] = useState<string[]>([]);

  // 删除后 viewTokens refetch 完成，清理临时删除列，只留下正在删除的
  useEffect(() => {
    if (viewTokens) {
      setRemovingTokens((prev) => {
        const finished = prev.filter((it) => !viewTokens.some((vt) => vt.address === it));
        return finished.length === 0 ? prev : prev.filter((it) => !finished.includes(it));
      });
    }
  }, [viewTokens]);

  // 从查看列表中移除 token
  const { mutateAsync: removeViewTokenAsync } = useRemoveTokenFromCollectionMutation();

  const handleRemoveViewToken = useAuthenticatedCallback(
    async (address: string) => {
      setRemovingTokens((prev) => [...prev, address]);
      await removeViewTokenAsync({
        tokenAddress: address,
        type: "views",
      });
    },
    [removeViewTokenAsync],
  );

  // 如果当前查看的 token 不在 viewTokens 中，默认加到第一个
  const tokens = useMemo(() => {
    if (!token) return [];
    if (!viewTokens) return [token];
    return uniqBy(
      (viewTokens.findIndex((it) => it.address === token.address) < 0
        ? [token, ...viewTokens]
        : viewTokens
      ).filter((it) => !removingTokens.includes(it.address)),
      "address",
    );
  }, [viewTokens, token, removingTokens]);

  // 是否在查看列表第一个
  const isFirst = useMemo(
    () => !token || tokens.length === 0 || tokens[0].address === token.address,
    [token, tokens],
  );

  // 跳到前一个 token
  const handlePrev = useCallback(() => {
    if (!token) return;
    const idx = tokens.findIndex((it) => it.address === token.address);
    if (idx > 0) {
      const prevToken = tokens[idx - 1];
      navigate(`${AppRoute.trade}/${prevToken.chain}/${prevToken.address}`);
    }
  }, [token, tokens, navigate]);

  // 是否在查看列表最后一个
  const isLast = useMemo(
    () => !token || tokens.length === 0 || tokens[tokens.length - 1].address === token.address,
    [token, tokens],
  );

  // 跳到后一个 token
  const handleNext = useCallback(() => {
    if (!token) return;
    const idx = tokens.findIndex((it) => it.address === token.address);
    if (idx >= 0 && idx < tokens.length - 1) {
      const nextToken = tokens[idx + 1];
      navigate(`${AppRoute.trade}/${nextToken.chain}/${nextToken.address}`);
    }
  }, [token, tokens, navigate]);

  // 从查看列表移除 token，并跳走
  const handleClose = useCallback(() => {
    if (!token) return;
    const idx = tokens.findIndex((it) => it.address === token.address);
    if (idx < 0) return;
    const nextToken =
      idx < tokens.length - 1 ? tokens[idx + 1] : idx > 0 ? tokens[idx - 1] : undefined;
    handleRemoveViewToken(token.address);
    if (nextToken) {
      navigate(`${AppRoute.trade}/${nextToken.chain}/${nextToken.address}`);
    } else {
      navigate(AppRoute.home);
    }
  }, [token, tokens, navigate, handleRemoveViewToken]);

  const handleTrade = useAuthenticatedCallback(() => {
    appSdk.events.emit("instant_trade:open");
  }, [appSdk]);

  return (
    <>
      <div
        className={clsx(
          "z-20 fixed inset-x-4 bottom-2.5 h-[50px] px-2.5 bg-content2 rounded-full overflow-hidden md:hidden",
          "flex justify-between items-center gap-2.5",
          "shadow-md",
        )}
      >
        <Button
          isIconOnly
          className="flex flex-none w-8 min-w-0 h-8 min-h-0 rounded-full bg-content3 text-foreground disabled:text-neutral"
          disableRipple
          isDisabled={isFirst}
          onPress={handlePrev}
        >
          <ArrowLeftIcon width={20} height={20} />
        </Button>

        <Button
          isIconOnly
          className="flex flex-none w-[60px] min-w-0 h-8 min-h-0 rounded-full bg-content3 text-foreground disabled:text-neutral"
          disableRipple
          isDisabled={!token}
          onPress={toggleFavorite}
        >
          {isFavorite ? (
            <FavoriteFilledIcon width={20} height={20} />
          ) : (
            <FavoriteOutlinedIcon width={20} height={20} />
          )}
        </Button>

        <Button
          className="flex grow-0 shrink w-auto min-w-[60px] h-8 min-h-0 rounded-full gap-0.5"
          color="primary"
          disableRipple
          startContent={<TradeOutlinedIcon width={18} height={18} />}
          onPress={handleTrade}
        >
          {t("extend.footer.trade")}
        </Button>

        <Button
          isIconOnly
          className="flex flex-none w-[60px] min-w-0 h-8 min-h-0 rounded-full bg-content3 text-foreground disabled:text-neutral"
          disableRipple
          isDisabled={!user || !token}
          onPress={handleClose}
        >
          <CloseIcon width={14} height={14} />
        </Button>

        <Button
          isIconOnly
          className="flex flex-none w-8 min-w-0 h-8 min-h-0 rounded-full bg-content3 text-foreground disabled:text-neutral"
          disableRipple
          isDisabled={isLast}
          onPress={handleNext}
        >
          <ArrowRightIcon width={20} height={20} />
        </Button>
      </div>

      {/* instant trade modal */}
      <Modal id="instant_trade:open" header={t("extend.trade.title")}>
        <InstantTrade />
      </Modal>
    </>
  );
}

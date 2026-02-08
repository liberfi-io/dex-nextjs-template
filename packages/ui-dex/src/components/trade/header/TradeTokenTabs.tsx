import {
  BackwardIcon,
  BearishIcon,
  BullishIcon,
  CloseIcon,
  CloseTabsIcon,
  ForwardIcon,
  ViewListOutlinedIcon,
} from "@/assets";
import { Number } from "@/components/Number";
import { AppRoute, formatPercentage, tokenPriceChangeRatioInUsd } from "@/libs";
import { Token } from "@chainstream-io/sdk";
import { useRemoveTokenFromCollectionMutation } from "@liberfi/react-backend";
import { Button, Skeleton } from "@heroui/react";
import clsx from "clsx";
import { throttle, uniqBy } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useAuthenticatedCallback, useRouter } from "@liberfi/ui-base";
import { useTradeDataContext } from "../providers";
import { tokenInfoAtom } from "@/states";
import { useAtomValue } from "jotai";

export function TradeTokenTabs() {
  const { navigate } = useRouter();

  const { user } = useAuth();

  const { viewTokens } = useTradeDataContext();

  const token = useAtomValue(tokenInfoAtom);

  // 滑动区域
  const ref = useRef<HTMLDivElement>(null);

  // 列表超过可见区域，需要翻页
  const [pagination, setPagination] = useState(false);
  const [disableForward, setDisableForward] = useState(false);
  const [disableBackward, setDisableBackward] = useState(false);

  // 监听滑动区域变化
  const handleScroll = useMemo(
    () =>
      throttle(() => {
        if (ref.current) {
          const { scrollLeft, scrollWidth, clientWidth } = ref.current;
          setPagination(scrollWidth > clientWidth);
          setDisableBackward(scrollLeft === 0);
          setDisableForward(scrollLeft + clientWidth >= scrollWidth);
        }
      }, 100),
    [setPagination, setDisableBackward, setDisableForward],
  );

  useEffect(() => {
    const container = ref.current;
    const resizeObserver = new ResizeObserver(handleScroll);
    if (container) {
      resizeObserver.observe(container);
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // 滑动区域向前翻一页
  const handleBackward = useCallback(() => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const page = Math.ceil(scrollLeft / clientWidth) - 1;
      const scrollTo = clientWidth * page;
      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  }, []);

  // 滑动区域向后翻一页
  const handleForward = useCallback(() => {
    if (ref.current) {
      const { scrollLeft, clientWidth, scrollWidth } = ref.current;
      const page = Math.floor(scrollLeft / clientWidth) + 1;
      const scrollTo = Math.min(scrollWidth - clientWidth, clientWidth * page);
      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  }, []);

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

  // 清空查看列表（当前查看的 token 除外）
  const handleClearViewList = useAuthenticatedCallback(async () => {
    const removes = tokens.filter((it) => it.address !== token?.address).map((it) => it.address);
    if (removes.length > 0) {
      setRemovingTokens((prev) => [...prev, ...removes]);
      await Promise.all(
        removes.map((it) =>
          removeViewTokenAsync({
            tokenAddress: it,
            type: "views",
          }),
        ),
      );
    }
  }, [token?.address, tokens, removeViewTokenAsync]);

  // 列表内容变化，重新计算滚动区域
  useEffect(() => {
    handleScroll();
  }, [handleScroll, tokens]);

  // 切换 token 时自动定位到对应的 tab
  const scrollToTokenRef = useRef(false);
  useEffect(() => {
    if (token?.address) scrollToTokenRef.current = true;
  }, [token?.address]);

  useEffect(() => {
    if (!ref.current || !scrollToTokenRef.current) return;
    const tab = ref.current.querySelector(`[data-active=true]`);
    if (tab) {
      tab.scrollIntoView({ behavior: "smooth", inline: "center" });
      scrollToTokenRef.current = false;
    }
  }, [tokens]);

  return (
    <div className="w-full h-full px-4 flex items-center gap-2">
      {/* token tabs */}
      <div className="flex-1 flex items-center gap-2 overflow-hidden">
        {/* tab icon */}
        <ViewListOutlinedIcon width={20} height={20} className="flex-none text-neutral" />
        {/* tab list */}
        <div ref={ref} className="flex-1 flex items-center gap-2 overflow-x-scroll scrollbar-hide">
          {/* skeletons */}
          {tokens.length === 0 &&
            [...Array(3)].map((_, index) => (
              <Skeleton key={index} className="w-36 h-6 rounded-full" />
            ))}

          {/* tab items */}
          {tokens.length > 0 &&
            tokens.map((it) => (
              <TradeTokenTab
                key={it.address}
                token={it}
                active={it.address === token?.address}
                onRemove={() => handleRemoveViewToken(it.address)}
                onSelect={() => navigate(`${AppRoute.trade}/${it.chain}/${it.address}`)}
              />
            ))}
        </div>
      </div>

      {/* actions */}
      <div className="flex-none flex items-center gap-2">
        {pagination && (
          <>
            {/* 向前翻页 */}
            <Button
              isIconOnly
              className={clsx(
                "flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-neutral hover:text-foreground rounded-none",
                "disabled:opacity-disabled disabled:hover:opacity-disabled disabled:cursor-not-allowed",
              )}
              disableRipple
              isDisabled={disableBackward}
              onPress={handleBackward}
            >
              <BackwardIcon width={12} />
            </Button>

            {/* 向后翻页 */}
            <Button
              isIconOnly
              className={clsx(
                "flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-neutral hover:text-foreground rounded-none",
                "disabled:opacity-disabled disabled:hover:opacity-disabled disabled:cursor-not-allowed",
              )}
              disableRipple
              isDisabled={disableForward}
              onPress={handleForward}
            >
              <ForwardIcon width={12} />
            </Button>

            {/* 清空查看列表 */}
            <Button
              isIconOnly
              className={clsx(
                "flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-neutral hover:text-foreground rounded-none",
                "disabled:opacity-disabled disabled:hover:opacity-disabled disabled:cursor-not-allowed",
              )}
              disableRipple
              isDisabled={!user || tokens.length <= 1}
              onPress={handleClearViewList}
            >
              <CloseTabsIcon width={18} height={18} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

type TradeTokenTabProps = {
  token: Token;
  active: boolean;
  onRemove: () => void;
  onSelect: () => void;
};

function TradeTokenTab({ token, active, onRemove, onSelect }: TradeTokenTabProps) {
  const priceChange = useMemo(
    () =>
      tokenPriceChangeRatioInUsd(token, "24h")
        ? formatPercentage(tokenPriceChangeRatioInUsd(token, "24h")!)
        : undefined,
    [token],
  );

  const bearish = useMemo(() => priceChange && priceChange.startsWith("-"), [priceChange]);

  return (
    <div
      className={clsx(
        "h-6 px-2.5 rounded-full text-xxs whitespace-nowrap cursor-pointer hover:opacity-80",
        "flex items-center gap-1.5",
        "bg-content3 data-[active=true]:data-[bearish=true]:bg-bearish/20 data-[active=true]:data-[bearish=false]:bg-bullish/20",
      )}
      onClick={onSelect}
      data-active={active}
      data-bearish={bearish}
    >
      {/* token symbol */}
      <span className="text-foreground">{token.symbol}</span>
      {/* price, hide on mobile */}
      <span
        className="max-xl:hidden text-bullish data-[bearish=true]:text-bearish"
        data-bearish={bearish}
      >
        {token.marketData.priceInUsd ? (
          <Number value={token.marketData.priceInUsd} defaultCurrencySign="$" />
        ) : (
          "-"
        )}
      </span>
      {/* price change */}
      <span
        className="flex items-center gap-0.5 text-bullish data-[bearish=true]:text-bearish"
        data-bearish={bearish}
      >
        {bearish ? <BearishIcon width={8} height={8} /> : <BullishIcon width={8} height={8} />}
        {priceChange ? `${priceChange.startsWith("-") ? priceChange.slice(1) : priceChange}` : "-"}
      </span>
      {/* remove token */}
      {!active && (
        <Button
          isIconOnly
          className="flex w-auto min-w-0 h-auto min-h-0 bg-transparent rounded-full"
          disableRipple
          onPress={onRemove}
        >
          <CloseIcon width={10} height={10} className="text-neutral" />
        </Button>
      )}
    </div>
  );
}

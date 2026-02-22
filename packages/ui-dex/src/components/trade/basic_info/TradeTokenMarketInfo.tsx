import { Skeleton } from "@heroui/react";
import { TradeTokenHolders } from "./TradeTokenHolders";
import { TradeTokenMCap } from "./TradeTokenMCap";
import { TradeTokenPrice } from "./TradeTokenPrice";
import { TradeTokenVolume } from "./TradeTokenVolume";
import { Token } from "@chainstream-io/sdk";
// import { BubbleMapIcon } from "../../../assets";
// import { useAppSdk, useTranslation } from "../../../hooks";
// import { useCallback } from "react";
// import { getBubbleMapUrl } from "../../../libs";
// import { Chain } from "@liberfi/core";
import { tokenInfoAtom } from "../../../states";
import { useAtomValue } from "jotai";

export function TradeTokenMarketInfo() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <Skeletons />;
}

function Content({ token }: { token: Token }) {
  return (
    <div className="flex-1 h-full px-6 flex items-center justify-between bg-content1 gap-5">
      <div className="flex-none flex items-center gap-5">
        <TradeTokenPrice />
      </div>
      <div className="flex-1 flex items-center justify-end gap-5">
        <TradeTokenMCap token={token} />
        <TradeTokenVolume token={token} />
        <TradeTokenHolders token={token} />
      </div>
      {/* <div className="flex-none flex items-center">
        <Button
          isIconOnly
          className="bg-transparent text-neutral"
          disableRipple
          onPress={handleBubbleMap}
        >
          <BubbleMapIcon width={16} height={16} />
        </Button>
      </div> */}
    </div>
  );
}

function Skeletons() {
  return (
    <div className="flex-1 h-full pl-6 pr-3 flex items-center bg-content1 gap-5">
      {[...Array(5)].map((_, index) => (
        <Skeleton key={index} className="w-28 h-8 rounded-lg" />
      ))}
    </div>
  );
}

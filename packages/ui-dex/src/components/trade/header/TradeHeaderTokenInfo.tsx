import { Token } from "@chainstream-io/sdk";
import { TradeHeaderTokenMarketData } from "./TradeHeaderTokenMarketData";
import { TradeHeaderTokenPrice } from "./TradeHeaderTokenPrice";
import { Skeleton } from "@heroui/react";
import { tokenInfoAtom } from "../../../states";
import { useAtomValue } from "jotai";

export function TradeHeaderTokenInfo() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <Skeletons />;
}

function Content({ token }: { token: Token }) {
  return (
    <div className="w-full md:hidden h-28 mb-2.5 px-5 flex items-center gap-2.5">
      <TradeHeaderTokenPrice token={token} />
      <TradeHeaderTokenMarketData token={token} />
    </div>
  );
}

function Skeletons() {
  return (
    <div className="w-full md:hidden h-28 mb-2.5 px-5 flex items-center gap-2.5">
      <div className="flex-1 h-full overflow-hidden">
        <div className="w-full h-full flex flex-col justify-center">
          <div className="w-[100px] h-9 flex items-center">
            <Skeleton className="w-full h-7 rounded-lg" />
          </div>
          <div className="mt-1 w-[60px] h-6 flex items-center">
            <Skeleton className="w-full h-4 rounded-lg" />
          </div>
          <div className="mt-2 w-[120px] h-5 flex items-center">
            <Skeleton className="w-full h-4 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex-none h-full overflow-hidden">
        <div className="w-full h-full flex flex-col justify-center items-start gap-2.5">
          <Skeleton className="w-[128px] h-7 rounded-lg" />
          <Skeleton className="w-[128px] h-7 rounded-lg" />
          <Skeleton className="w-[128px] h-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

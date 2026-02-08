import { Token } from "@chainstream-io/sdk";
import { TradeTokenSocialMedia } from "../basic_info/TradeTokenSocialMedia";
import { TradeTokenDescription } from "./TradeTokenDescription";
import { TradeTokenCategories } from "./TradeTokenCategories";
import { TradeTokenCEXListing } from "./TradeTokenCEXListing";
import { TradeTokenLiquidities, TradeTokenLiquiditiesSkeleton } from "./TradeTokenLiquidities";
import { TradeTokenSecurity, TradeTokenSecuritySkeleton } from "./TradeTokenSecurity";
import { tokenInfoAtom } from "@/states";
import { useAtomValue } from "jotai";

export function TradeTokenAbout() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <Skeletons />;
}

function Content({ token }: { token: Token }) {
  return (
    <div className="md:flex-1 w-full p-3 md:pt-0 flex flex-col gap-5 md:overflow-auto scrollbar-hide">
      <TradeTokenSocialMedia token={token} />
      <TradeTokenDescription token={token} />
      <TradeTokenCategories token={token} />
      <TradeTokenCEXListing token={token} />
      <TradeTokenLiquidities token={token} />
      <TradeTokenSecurity token={token} />
    </div>
  );
}

function Skeletons() {
  return (
    <div className="md:flex-1 w-full p-3 md:pt-0 flex flex-col gap-5 md:overflow-auto scrollbar-hide">
      <TradeTokenLiquiditiesSkeleton />
      <TradeTokenSecuritySkeleton />
    </div>
  );
}

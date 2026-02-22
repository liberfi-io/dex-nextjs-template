import { Chain } from "@liberfi/core";
import { useTokenListContext } from "../TokenListContext";
import { ChainSelectMobile, ChainSelectMobileProps } from "../../ChainSelectMobile";

export function ChainFilterMobile(props: Pick<ChainSelectMobileProps, "classNames">) {
  const { chainId, setChainId } = useTokenListContext();
  return <ChainSelectMobile chainId={chainId as Chain} onSelect={setChainId} {...props} />;
}

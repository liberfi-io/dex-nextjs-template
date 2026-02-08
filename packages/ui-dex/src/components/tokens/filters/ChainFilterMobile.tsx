import { CHAIN_ID } from "@liberfi/core";
import { useTokenListContext } from "../TokenListContext";
import { ChainSelectMobile, ChainSelectMobileProps } from "@/components/ChainSelectMobile";

export function ChainFilterMobile(props: Pick<ChainSelectMobileProps, "classNames">) {
  const { chainId, setChainId } = useTokenListContext();
  return <ChainSelectMobile chainId={chainId as CHAIN_ID} onSelect={setChainId} {...props} />;
}

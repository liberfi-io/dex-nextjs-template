import { Chain } from "@liberfi/core";
import { useTokenListContext } from "../TokenListContext";
import { ChainSelect, ChainSelectProps } from "../../ChainSelect";

export function ChainFilter(props: Pick<ChainSelectProps, "trigger">) {
  const { chainId, setChainId } = useTokenListContext();
  return <ChainSelect chainId={chainId as Chain} onSelect={setChainId} {...props} />;
}

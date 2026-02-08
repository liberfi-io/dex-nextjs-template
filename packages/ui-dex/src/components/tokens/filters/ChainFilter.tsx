import { CHAIN_ID } from "@liberfi/core";
import { useTokenListContext } from "../TokenListContext";
import { ChainSelect, ChainSelectProps } from "@/components/ChainSelect";

export function ChainFilter(props: Pick<ChainSelectProps, "trigger">) {
  const { chainId, setChainId } = useTokenListContext();
  return <ChainSelect chainId={chainId as CHAIN_ID} onSelect={setChainId} {...props} />;
}

import { useAtom } from "jotai";
import { ChainSelectUI } from "./chain-select.ui";
import { chainAtom } from "@liberfi/ui-base";

export type ChainSelectWidgetProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ChainSelectWidget({ size, className }: ChainSelectWidgetProps) {
  const [chain, setChain] = useAtom(chainAtom);

  return <ChainSelectUI chain={chain} onSelectChain={setChain} size={size} className={className} />;
}

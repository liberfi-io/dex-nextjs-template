import type { Chain } from "@liberfi.io/types";
import { TokenStatsFlipWidget } from "@liberfi.io/ui-tokens";

export interface SidebarVolumeStatsProps {
  chain: Chain;
  address: string;
}

/**
 * Right-sidebar stats block that cross-fades between volume and price-change
 * windows on hover, mirroring Axiom's signature interaction. The legacy
 * three-card overview has been replaced by a single `TokenStatsFlipWidget`
 * that subscribes to `useTokenStatsQuery` for each resolution internally.
 */
export function SidebarVolumeStats({ chain, address }: SidebarVolumeStatsProps) {
  return (
    <TokenStatsFlipWidget
      chain={chain}
      address={address}
      className="border-b border-default-100"
    />
  );
}

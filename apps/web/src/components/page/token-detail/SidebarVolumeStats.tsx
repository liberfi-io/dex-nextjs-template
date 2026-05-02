import type { Chain } from "@liberfi.io/types";
import {
  TokenTradersOverviewWidget,
  TokenTransactionsOverviewWidget,
  TokenVolumesOverviewWidget,
} from "@liberfi.io/ui-tokens";

export interface SidebarVolumeStatsProps {
  chain: Chain;
  address: string;
}

/**
 * Right-sidebar overview stack. Each card is a self-contained react-sdk widget
 * that subscribes to the live token via `useLiveToken` internally, so all
 * three cards stay in sync without the dex layer orchestrating data.
 */
export function SidebarVolumeStats({ chain, address }: SidebarVolumeStatsProps) {
  return (
    <div className="flex flex-col border-b border-neutral-800">
      <div className="flex flex-col gap-3 p-4">
        <TokenTransactionsOverviewWidget chain={chain} address={address} />
        <TokenVolumesOverviewWidget chain={chain} address={address} />
        <TokenTradersOverviewWidget chain={chain} address={address} />
      </div>
    </div>
  );
}

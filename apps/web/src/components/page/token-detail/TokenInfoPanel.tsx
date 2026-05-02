import type { Chain } from "@liberfi.io/types";
import {
  TokenAboutWidget,
  TokenCategoriesWidget,
  TokenLiquiditiesWidget,
  TokenSecurityWidget,
} from "@liberfi.io/ui-tokens";

export interface TokenInfoPanelProps {
  chain: Chain;
  address: string;
}

/**
 * Sidebar "Token Info" accordion-style panel. Composes react-sdk info widgets
 * so each section (security / about / categories / liquidities) reads from
 * `@liberfi.io/react` hooks directly. The Axiom-style collapsible header stays
 * as a dex-layer detail; individual sections are now self-contained widgets.
 */
export function TokenInfoPanel({ chain, address }: TokenInfoPanelProps) {
  return (
    <div className="flex flex-col">
      {/* Section header — Axiom: h=36px, pl=8px, pr=16px, pt=4px, jc=space-between */}
      <div className="flex h-[36px] flex-row items-center justify-between gap-4 pl-2 pr-4 pt-1">
        <button className="group flex h-7 w-fit flex-row items-center justify-start rounded pl-2 pr-1 text-sm font-medium text-[rgb(200,201,209)] hover:bg-neutral-800/50 transition-colors">
          Token Info
          <svg
            className="ml-1 h-3 w-3 text-[rgb(119,122,140)] transition-transform group-hover:rotate-180"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path
              d="M3 5l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="mb-0.5">
          <svg
            className="h-6 w-6 text-[rgb(119,122,140)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M4 4v5h5M20 20v-5h-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Content — composed from react-sdk widgets */}
      <div className="flex flex-col gap-4 p-4 pt-1">
        <TokenAboutWidget chain={chain} address={address} />
        <TokenSecurityWidget chain={chain} address={address} />
        <TokenCategoriesWidget chain={chain} address={address} />
        <TokenLiquiditiesWidget chain={chain} address={address} />
      </div>
    </div>
  );
}

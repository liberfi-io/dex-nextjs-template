import { UsdcIcon } from "@liberfi.io/ui";
import { cn } from "@liberfi.io/ui";

import { HyperliquidIcon } from "./HyperliquidIcon";

/**
 * Composite icon: USDC token mark with a Hyperliquid badge in the
 * bottom-right corner, mirroring the chain-badge style used elsewhere
 * (e.g. BNB token + BSC chain badge).
 *
 * `size` controls the outer USDC circle in px; the HL badge is rendered
 * at ~45% of that, with a small dark ring to separate it from the USDC
 * outline.
 */
export function HyperliquidUsdcIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const badgeSize = Math.round(size * 0.5);
  const ringSize = badgeSize + 2;

  return (
    <div
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
    >
      <UsdcIcon width={size} height={size} />
      <div
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#18181b]"
        style={{ width: ringSize, height: ringSize }}
      >
        <HyperliquidIcon width={badgeSize} height={badgeSize} />
      </div>
    </div>
  );
}

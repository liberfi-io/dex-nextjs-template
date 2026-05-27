"use client";

import { cn } from "@liberfi.io/ui";

export interface PortfolioGradientAvatarProps {
  /** Address (or any string) used as a deterministic gradient seed. */
  seed?: string;
  /** Pixel size — width and height. Defaults to 32. */
  size?: number;
  /** Border radius (e.g. "rounded-xl"). Defaults to "rounded-2xl". */
  className?: string;
}

/**
 * Deterministic gradient avatar derived from a wallet address. Mirrors the
 * `GradientAvatar` used by the header `DexAccountButton` dropdown so the
 * portfolio page header and the global header use the same visual identity
 * for a given wallet.
 *
 * The gradient is computed from a simple character-sum hash of `seed`. It is
 * intentionally shape-only (no text inside) — the address itself is rendered
 * separately by the caller.
 */
export function PortfolioGradientAvatar({
  seed,
  size = 32,
  className,
}: PortfolioGradientAvatarProps) {
  const hash = seed
    ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const c1 = `hsl(${(hash * 37) % 360}, 70%, 60%)`;
  const c2 = `hsl(${(hash * 73) % 360}, 65%, 45%)`;
  const c3 = `hsl(${(hash * 113) % 360}, 75%, 55%)`;

  return (
    <div
      className={cn("rounded-2xl shadow-inner flex-shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
      }}
    />
  );
}

"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChainAwareLink } from "./ChainAwareLink";
import { useTranslation } from "@liberfi.io/i18n";
import { ChartLineIcon, ZapFastIcon, UserIcon, cn } from "@liberfi.io/ui";

type SubNavItem = {
  key: "markets" | "matches" | "portfolio";
  href: string;
  icon: React.ReactNode;
};

const SUB_NAV_ITEMS: SubNavItem[] = [
  { key: "markets", href: "/predict", icon: <ChartLineIcon width={16} height={16} /> },
  { key: "matches", href: "/predict/matches", icon: <ZapFastIcon width={16} height={16} /> },
  { key: "portfolio", href: "/predict/portfolio", icon: <UserIcon width={16} height={16} /> },
];

/**
 * Sticky internal sub-nav for the /predict module.
 * Keeps Markets / Matches / Portfolio entries co-located with the predict
 * content so the main app nav stays uncluttered.
 */
export function PredictSubNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const items = useMemo(
    () =>
      SUB_NAV_ITEMS.map((item) => {
        const active =
          item.href === "/predict"
            ? !SUB_NAV_ITEMS.some(
                (other) => other.href !== "/predict" && pathname.startsWith(other.href),
              )
            : pathname.startsWith(item.href);
        return {
          ...item,
          active,
          label: t(`predict.subnav.${item.key}`) as string,
        };
      }),
    [pathname, t],
  );

  return (
    <nav
      className="w-full"
      // Match the styling used by every sticky strip inside the prediction
      // SDK (events categories widget, matches toolbar): same backdrop blur
      // intensity, background tint, and border alpha. Keeping these values in
      // sync prevents the SubNav border from looking visually heavier than
      // the bordered sticky element rendered directly below it on /predict.
      style={{
        background: "hsl(var(--heroui-background) / 0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
      aria-label="Prediction sub navigation"
    >
      <div className="w-full px-6 max-lg:px-4 max-sm:px-3 flex items-center justify-center gap-1 h-11">
        {items.map((item) => (
          <ChainAwareLink
            key={item.key}
            href={item.href}
            prefetch
            data-active={item.active}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[10px] transition-colors cursor-pointer whitespace-nowrap focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              item.active
                ? "text-brand-primary bg-action-primary/[0.08]"
                : "text-text-muted hover:text-text-primary hover:bg-surface-interactive/40",
            )}
          >
            {item.icon}
            {item.label}
          </ChainAwareLink>
        ))}
      </div>
    </nav>
  );
}

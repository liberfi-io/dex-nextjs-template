"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChainAwareLink } from "./ChainAwareLink";
import { useTranslation } from "@liberfi.io/i18n";
import {
  ChartLineIcon,
  CoinsIcon,
  GiftIcon,
  UserIcon,
  ZapFastIcon,
  cn,
} from "@liberfi.io/ui";
import {
  isPredictionNavItemActive,
  PREDICTION_NAV_ITEMS,
  type PredictionNavKey,
} from "./prediction-navigation";

const NAV_ICONS: Record<PredictionNavKey, React.ReactNode> = {
  sports: <ChartLineIcon width={16} height={16} />,
  esports: <ZapFastIcon width={16} height={16} />,
  markets: <CoinsIcon width={16} height={16} />,
  leaderboard: <LeaderboardIcon />,
  portfolio: <UserIcon width={16} height={16} />,
  referral: <GiftIcon width={16} height={16} />,
};

/**
 * Sticky internal sub-nav for the /predict module.
 * Mirrors the six visible destinations from prediction-nextjs-template while
 * keeping them under the primary Predict destination in the host app.
 */
export function PredictSubNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const items = useMemo(
    () =>
      PREDICTION_NAV_ITEMS.map((item) => {
        return {
          ...item,
          active: isPredictionNavItemActive(pathname, item),
          icon: NAV_ICONS[item.key],
          label: t(
            item.key === "portfolio"
              ? "extend.portfolio.title"
              : `extend.nav.${item.key}`,
          ) as string,
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
      <div className="flex h-11 w-full items-center justify-start gap-1 overflow-x-auto px-6 [scrollbar-width:none] max-lg:px-4 max-sm:px-3 lg:justify-center [&::-webkit-scrollbar]:hidden">
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

function LeaderboardIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

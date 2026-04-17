"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@liberfi.io/i18n";
import {
  ChartLineIcon,
  ZapFastIcon,
  UserIcon,
  cn,
} from "@liberfi.io/ui";

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
                (other) =>
                  other.href !== "/predict" && pathname.startsWith(other.href),
              )
            : pathname.startsWith(item.href);
        return {
          ...item,
          active,
          label: t(`extend.predict.subnav.${item.key}`) as string,
        };
      }),
    [pathname, t],
  );

  return (
    <nav
      className="sticky top-0 z-30 w-full bg-[#0a0a0b]/95 backdrop-blur"
      style={{ borderBottom: "1px solid rgba(39,39,42,0.6)" }}
      aria-label="Prediction sub navigation"
    >
      <div className="w-full max-w-[1550px] mx-auto px-6 max-lg:px-4 max-sm:px-3 flex items-center gap-1 h-11">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            prefetch
            data-active={item.active}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[10px] transition-colors cursor-pointer whitespace-nowrap focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              item.active
                ? "text-[#c7ff2e] bg-[#c7ff2e]/[0.08]"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

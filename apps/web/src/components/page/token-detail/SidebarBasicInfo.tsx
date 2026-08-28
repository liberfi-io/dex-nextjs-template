"use client";

import { useTokenQuery } from "@liberfi.io/react";
import type { Chain } from "@liberfi.io/types";
import {
  formatAmount,
  formatAmountInUsd,
  formatMCapInUsd,
  truncateAddress,
} from "@liberfi.io/utils";
import { useTranslation } from "@liberfi.io/i18n";
import { CollapsibleSection } from "@liberfi.io/ui-scaffold";
import { ReactNode, useMemo } from "react";

export interface SidebarBasicInfoProps {
  chain: Chain;
  address: string;
}

/**
 * GMGN-style "Basic Data" card for the right sidebar. Each row is a
 * `label / value` pair stacked vertically inside a collapsible panel:
 *
 *   ┌─────────────────────────────────┐
 *   │ ⌄ Basic Info                    │  ← collapsible header
 *   ├─────────────────────────────────┤
 *   │ Market Cap            $182.35   │  ← label 12px text-default-700
 *   │ Liquidity             $15.6M    │     value 13px text-foreground 500
 *   │ 24h Volume            $142.4K   │
 *   │ Holders               8         │
 *   │ Total Supply          1.65M     │
 *   │ Pair                  DBiN...   │
 *   │ Token Created         05/25 …   │
 *   └─────────────────────────────────┘
 *
 * Mirrors GMGN's "基础数据" section per `gmgn-token-detail-design-reference`
 * §8.5. All colors come from the HeroUI theme tokens (no hex), so the card
 * adapts to theme switches.
 */
export function SidebarBasicInfo({ chain, address }: SidebarBasicInfoProps) {
  const { t } = useTranslation();
  const { data: token } = useTokenQuery({ chain, address });

  const md = token?.marketData;
  const stats24h = token?.stats?.["24h"];

  const createdAt = useMemo(() => {
    const c = token?.createdAt;
    if (!c) return null;
    const d = c instanceof Date ? c : new Date(c);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  }, [token?.createdAt]);

  // Pick the deepest-liquidity pool to show as the trading pair — falls back
  // to the first pool when TVL data is missing.
  const pair = useMemo(() => {
    const pools = token?.liquidities;
    if (!pools || pools.length === 0) return null;
    const sorted = [...pools].sort((a, b) => {
      const av = Number(a.tvlInUsd ?? 0);
      const bv = Number(b.tvlInUsd ?? 0);
      return bv - av;
    });
    const top = sorted[0];
    return top?.pairAddress ?? top?.poolAddress ?? null;
  }, [token?.liquidities]);

  return (
    <CollapsibleSection
      title={t("extend.trade.basic_info.title")}
      defaultOpen
      className="border-t border-divider"
      bodyClassName="px-4 pb-4"
    >
      <ul className="flex flex-col">
        <Row
          label={t("extend.trade.basic_info.market_cap")}
          value={formatMCapInUsd(md?.marketCapInUsd ?? "")}
        />
        <Row
          label={t("extend.trade.basic_info.liquidity")}
          value={formatAmountInUsd(md?.tvlInUsd ?? "")}
        />
        <Row
          label={t("extend.trade.basic_info.volume_24h")}
          value={formatAmountInUsd(stats24h?.volumesInUsd ?? "")}
        />
        <Row
          label={t("extend.trade.basic_info.holders")}
          value={formatAmount(md?.holders ?? "")}
        />
        <Row
          label={t("extend.trade.basic_info.supply")}
          value={formatAmount(md?.totalSupply ?? "")}
        />
        {pair && (
          <Row
            label={t("extend.trade.basic_info.pair")}
            value={truncateAddress(pair, 4, 4)}
          />
        )}
        {createdAt && (
          <Row
            label={t("extend.trade.basic_info.created_at")}
            value={createdAt}
          />
        )}
      </ul>
    </CollapsibleSection>
  );
}

/**
 * Single label / value row. Label on the left (12px / 400 / neutral), value
 * on the right (13px / 500 / foreground). 28px row height mirrors GMGN's
 * basic-data list rhythm.
 */
function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li className="flex h-7 items-center justify-between gap-2">
      <span className="text-[12px] font-normal text-default-700">{label}</span>
      <span
        className="truncate text-right text-[13px] font-medium tabular-nums text-foreground"
        style={{ letterSpacing: "-0.2px" }}
      >
        {value}
      </span>
    </li>
  );
}

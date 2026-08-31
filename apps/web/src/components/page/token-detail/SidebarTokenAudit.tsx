"use client";

import { useTokenQuery, useTokenSecurityQuery } from "@liberfi.io/react";
import { Chain, type TokenMarketData } from "@liberfi.io/types";
import { CheckIcon, StyledTooltip, XCloseIcon, cn } from "@liberfi.io/ui";
import { formatAmount, formatPercent, SafeBigNumber } from "@liberfi.io/utils";
import { useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../application/t";
import { ReactNode, useMemo } from "react";
import {
  getBurnRatio,
  getHasBlacklist,
  getIsLpBurned,
  getMintAuthorityRenounced,
  type TokenSecurityDetails,
} from "./securityMetrics";

export interface SidebarTokenAuditProps {
  chain: Chain;
  address: string;
}

/** Threshold above which a holding-concentration ratio is flagged as risky. */
const RISK_RATIO_THRESHOLD = 0.1;

type Status = "good" | "bad" | "neutral";

interface Metric {
  /** Translation key suffix (relative to `trade.audit`). */
  key: string;
  /** Value to render (already formatted). */
  value: ReactNode;
  /** Visual / semantic status of the value. */
  status: Status;
  /** Whether to render the leading status badge. */
  showStatusIcon?: boolean;
}

/**
 * Compact token-audit panel rendered below the trade form, mirroring GMGN's
 * quick-look grid. Each cell is centre-aligned with the label stacked above
 * the value+status icon:
 *
 *   ┌─────────────────────────┐
 *   │      Label              │
 *   │    ✓/✗  Value           │
 *   └─────────────────────────┘
 *
 * Content mirrors the trending-token list's "代币资讯列" (see
 * `packages/ui-tokens/.../token-info-cell.ui.tsx`):
 *
 *   Row 1 — Holding concentration:  Top 10  | DEV       | Holders | Snipers
 *   Row 2 — Holder cohorts:         Insiders | Bundlers | Pro     | KOL
 *
 * Risk semantics:
 *   - Ratio metrics (Top 10 / DEV / Snipers / Insiders / Bundlers):
 *     `good` (green ✓) when < 10%, `bad` (red ✗) when ≥ 10%.
 *   - Counter metrics (Holders / Pro / KOL): always `neutral` — just shown
 *     as plain numbers because cohort size alone is not a risk signal.
 *
 * Every cell is wrapped in a tooltip explaining what the metric measures.
 * Layout draws on Tailwind primitives — no inline color hexes; all colors
 * resolve through the HeroUI theme tokens (`text-positive`, `text-negative`,
 * `text-text-secondary`, etc.) so this section adapts to theme switches.
 */
export function SidebarTokenAudit({ chain, address }: SidebarTokenAuditProps) {
  const { t } = useTranslation();
  const { data: token } = useTokenQuery({ chain, address });
  const { data: securityData } = useTokenSecurityQuery({ chain, address });
  const security = securityData as TokenSecurityDetails | undefined;

  const metrics = useMemo<Metric[]>(
    () => buildMetrics(chain, token?.marketData, security),
    [chain, token?.marketData, security],
  );

  return (
    <section
      className="border-t border-divider bg-content1 px-3 py-5"
      aria-label={t("trade.audit.title")}
    >
      <div className="grid grid-cols-4 gap-x-2 gap-y-5">
        {metrics.map((m) => (
          <AuditCell
            key={m.key}
            label={tKey(t, `trade.audit.${m.key}`)}
            tooltip={tKey(t, `trade.audit.${m.key}_tip`)}
            value={m.value}
            status={m.status}
            showStatusIcon={m.showStatusIcon}
          />
        ))}
      </div>
    </section>
  );
}

function AuditCell({
  label,
  tooltip,
  value,
  status,
  showStatusIcon = true,
}: {
  label: string;
  tooltip: string;
  value: ReactNode;
  status: Status;
  showStatusIcon?: boolean;
}) {
  const valueColor =
    status === "good" ? "text-positive" : status === "bad" ? "text-negative" : "text-foreground";
  return (
    <StyledTooltip content={tooltip} placement="top">
      <div className="flex min-w-0 cursor-default flex-col items-center gap-1 text-center leading-none">
        <span className="text-[12px] font-normal text-text-secondary">{label}</span>
        <span
          className={cn(
            "flex items-center justify-center gap-1 text-[12px] font-medium tabular-nums",
            valueColor,
          )}
        >
          {showStatusIcon && <StatusBadge status={status} />}
          {value}
        </span>
      </div>
    </StyledTooltip>
  );
}

/**
 * Tiny status badge (✓ for `good`, ✗ for `bad`, nothing for `neutral`).
 * Mirrors GMGN's compact inline indicator. Sized at 10×10 so it nests
 * inside the 12px value line without inflating row height.
 */
function StatusBadge({ status }: { status: Status }) {
  if (status === "good") {
    return <CheckIcon className="h-2.5 w-2.5 shrink-0 text-positive" />;
  }
  if (status === "bad") {
    return <XCloseIcon className="h-2.5 w-2.5 shrink-0 text-negative" />;
  }
  return null;
}

/**
 * Map raw `TokenMarketData` into the 8 ordered cells rendered by the grid.
 * Splitting this out keeps the JSX dumb and makes the risk-classification
 * rules easy to audit/test in isolation.
 */
function buildMetrics(
  chain: Chain,
  md: TokenMarketData | undefined,
  security: TokenSecurityDetails | undefined,
): Metric[] {
  const metrics = [
    // Row 1 — holding concentration / dev exposure
    ratioMetric("top10", md?.top10HoldingsRatio),
    ratioMetric("dev", md?.devHoldingsRatio),
    counterMetric("holders", md?.holders),
    ratioMetric("snipers", md?.sniperHoldingsRatio),

    // Row 2 — risky-holder cohorts
    ratioMetric("insiders", md?.insiderHoldingsRatio),
    ratioMetric("bundlers", md?.bundleHoldingsRatio),
    counterMetric("pro", md?.proHolders),
    counterMetric("kol", md?.kolHolders),
  ];

  if (chain === Chain.SOLANA) {
    return [
      ...metrics,
      booleanMetric("mint_renounced", getMintAuthorityRenounced(security), true),
      booleanMetric("no_blacklist", getHasBlacklist(security), false),
      burnMetric("lp_burned", security),
      unknownMetric("rug_pull"),
    ];
  }

  if (chain === Chain.BINANCE || chain === Chain.ETHEREUM) {
    return [
      ...metrics,
      booleanMetric("not_honeypot", security?.isHoneypot, false),
      booleanMetric("open_source", security?.isOpenSource, true),
      booleanMetric("ownership_renounced", security?.isOwnershipRenounced, true),
      booleanMetric("lp_locked", security?.isLpLocked, true),
    ];
  }

  return metrics;
}

/**
 * Ratio metric (e.g. `top10HoldingsRatio`). Renders a percentage with risk
 * coloring tied to {@link RISK_RATIO_THRESHOLD}. Returns a `good` "0%" cell
 * when the upstream value is missing/zero — GMGN treats "0%" as the
 * baseline "no concentration detected" state rather than as a warning.
 */
function ratioMetric(key: string, ratio: string | undefined): Metric {
  if (!ratio || ratio === "0") {
    return { key, value: "0%", status: "good" };
  }
  const n = new SafeBigNumber(ratio);
  const risky = n.gte(RISK_RATIO_THRESHOLD);
  return {
    key,
    value: formatPercent(ratio),
    status: risky ? "bad" : "good",
  };
}

/**
 * Plain counter (e.g. `holders`, `proHolders`). Always neutral — counts are
 * informational, not pass/fail.
 */
function counterMetric(key: string, count: number | undefined): Metric {
  if (count === undefined || count === null) {
    return { key, value: "-", status: "neutral" };
  }
  return { key, value: formatAmount(count.toString()), status: "neutral" };
}

function booleanMetric(key: string, value: boolean | undefined, safeWhen: boolean): Metric {
  if (value === undefined) return unknownMetric(key);
  return { key, value: "", status: value === safeWhen ? "good" : "bad" };
}

function burnMetric(key: string, security: TokenSecurityDetails | undefined): Metric {
  const burnRatio = getBurnRatio(security);
  if (burnRatio !== undefined) {
    const burned = new SafeBigNumber(burnRatio).gt(0);
    return {
      key,
      value: (
        <>
          <span aria-hidden="true">🔥</span>
          {formatPercent(burnRatio)}
        </>
      ),
      status: burned ? "good" : "bad",
      showStatusIcon: false,
    };
  }
  return booleanMetric(key, getIsLpBurned(security), true);
}

function unknownMetric(key: string): Metric {
  return { key, value: "-", status: "neutral" };
}

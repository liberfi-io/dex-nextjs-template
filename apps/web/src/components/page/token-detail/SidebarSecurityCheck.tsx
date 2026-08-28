"use client";

import { useTokenQuery, useTokenSecurityQuery } from "@liberfi.io/react";
import {
  Chain,
  type TokenMarketData,
} from "@liberfi.io/types";
import {
  CheckIcon,
  Link,
  StyledTooltip,
  XCloseIcon,
  cn,
} from "@liberfi.io/ui";
import { CollapsibleSection } from "@liberfi.io/ui-scaffold";
import { formatPercent, SafeBigNumber } from "@liberfi.io/utils";
import { useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../application/t";
import Image from "next/image";
import { type ReactNode, useMemo } from "react";
import { buildSecurityProviderLinks } from "./securityLinks";
import {
  getBurnRatio,
  getHasBlacklist,
  getIsLpBurned,
  getMintAuthorityRenounced,
  type TokenSecurityDetails,
} from "./securityMetrics";

export interface SidebarSecurityCheckProps {
  chain: Chain;
  address: string;
}

/** Status of a single security check. */
type CheckStatus = "safe" | "risk" | "unknown";

interface CheckSpec {
  /** Translation key under `extend.trade.security_check.items`. */
  key: string;
  /** Resolved status from the security payload. */
  status: CheckStatus;
  /** Optional value rendered before the status icon. */
  value?: ReactNode;
  /** Whether to render the status icon. */
  showIcon?: boolean;
}

/**
 * GMGN-style "安全检测" (Security Check) card. Each row is a binary safe /
 * risky / unknown indicator with an inline tooltip explaining the check:
 *
 *   ┌─────────────────────────────────┐
 *   │ ⌄ Security              Safe    │  ← collapsible header + overall badge
 *   ├─────────────────────────────────┤
 *   │ No Transfer Fee            ✓    │  ← label + status icon
 *   │ Fee Not Upgradable         ✓    │
 *   │ Transferable               ✓    │
 *   │ Not Freezable              ✓    │
 *   │ Not Closable               ✓    │
 *   ├─────────────────────────────────┤
 *   │              [GoPlus] Powered…  │  ← brand attribution row
 *   └─────────────────────────────────┘
 *
 * Maps the five Solana SPL flags exposed by `useTokenSecurityQuery` (Helius
 * / GoPlus pipeline) onto user-facing checks. Items missing from the
 * upstream payload render as `--` (`unknown`) instead of being hidden, so
 * the row count stays stable across tokens.
 *
 * All colors come from HeroUI theme tokens (`text-bullish`, `text-bearish`,
 * `text-default-700`) — no hardcoded hex.
 */
export function SidebarSecurityCheck({
  chain,
  address,
}: SidebarSecurityCheckProps) {
  const { t } = useTranslation();
  const { data: token } = useTokenQuery({ chain, address });
  const { data: securityData } = useTokenSecurityQuery({ chain, address });
  const security = securityData as TokenSecurityDetails | undefined;

  const checks = useMemo<CheckSpec[]>(
    () => buildChecks(chain, token?.marketData, security, (key) => tKey(t, key)),
    [chain, token?.marketData, security, t],
  );

  const providerLinks = useMemo(
    () => buildSecurityProviderLinks(chain, address),
    [chain, address],
  );

  const overall = useMemo<CheckStatus>(() => {
    if (checks.every((c) => c.status === "unknown")) return "unknown";
    if (checks.some((c) => c.status === "risk")) return "risk";
    return "safe";
  }, [checks]);

  const overallText = useMemo(() => {
    if (overall === "unknown") return t("extend.trade.security_check.unknown");
    if (overall === "risk") return t("extend.trade.security_check.review");
    return t("extend.trade.security_check.safe");
  }, [overall, t]);

  return (
    <CollapsibleSection
      title={t("extend.trade.security_check.title")}
      defaultOpen
      className="border-t border-divider"
      bodyClassName="px-4 pb-4"
      rightSlot={
        <span
          className={cn(
            "mr-2 text-[12px] font-medium",
            overall === "safe"
              ? "text-bullish"
              : overall === "risk"
                ? "text-bearish"
                : "text-default-700",
          )}
        >
          {overallText}
        </span>
      }
    >
      <ul className="flex flex-col">
        {checks.map((c) => (
          <CheckRow
            key={c.key}
            label={tKey(t, `extend.trade.security_check.items.${c.key}`)}
            tooltip={tKey(t, `extend.trade.security_check.items.${c.key}_tip`)}
            status={c.status}
            value={c.value}
            showIcon={c.showIcon}
          />
        ))}
      </ul>

      {providerLinks.length > 0 && (
        <div className="mt-3 flex flex-nowrap items-center gap-3">
          {providerLinks.map((provider) => (
            <Link
              key={provider.key}
              href={provider.href}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 cursor-pointer items-center gap-1 text-[12px] font-medium text-foreground transition-opacity hover:opacity-80"
            >
              <Image
                src={provider.iconSrc}
                alt={provider.label}
                width={provider.iconWidth}
                height={provider.iconHeight}
                className="shrink-0"
              />
              <span>{provider.label}</span>
            </Link>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}

function CheckRow({
  label,
  tooltip,
  status,
  value,
  showIcon = true,
}: {
  label: string;
  tooltip: string;
  status: CheckStatus;
  value?: ReactNode;
  showIcon?: boolean;
}) {
  return (
    <li className="flex h-7 items-center justify-between gap-2">
      <StyledTooltip content={tooltip} placement="top">
        <span className="cursor-default text-[12px] font-normal text-default-700">
          {label}
        </span>
      </StyledTooltip>
      <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-foreground tabular-nums">
        {value}
        {showIcon && <StatusIndicator status={status} />}
      </span>
    </li>
  );
}

function StatusIndicator({ status }: { status: CheckStatus }) {
  if (status === "unknown") {
    return <span className="text-[12px] text-default-700">--</span>;
  }
  if (status === "safe") {
    return <CheckIcon className="h-3 w-3 shrink-0 text-bullish" />;
  }
  return <XCloseIcon className="h-3 w-3 shrink-0 text-bearish" />;
}

/**
 * Translate the raw {@link TokenSecurity} flags into a stable ordered list
 * of user-facing checks. Each flag has a `safeWhen` boolean indicating the
 * value that should be considered safe (e.g. `hasTransferFee` is safe when
 * `false`, while `isTransferable` is safe when `true`).
 */
function buildChecks(
  chain: Chain,
  marketData: TokenMarketData | undefined,
  security: TokenSecurityDetails | undefined,
  t: (key: string) => string,
): CheckSpec[] {
  if (chain === Chain.SOLANA) {
    return [
      flagCheck("mint_renounced", getMintAuthorityRenounced(security), true),
      flagCheck("no_blacklist", getHasBlacklist(security), false),
      burnCheck("lp_burned", security),
      top10Check(marketData?.top10HoldingsRatio),
    ];
  }

  if (chain === Chain.BINANCE || chain === Chain.ETHEREUM) {
    return [
      flagCheck("open_source", security?.isOpenSource, true),
      flagCheck("not_honeypot", security?.isHoneypot, false),
      flagCheck("ownership_renounced", security?.isOwnershipRenounced, true),
      flagCheck("no_blacklist", security?.hasBlacklist, false),
      taxPairCheck(
        "buy_sell_tax",
        t("extend.trade.security_check.values.buy"),
        security?.buyTaxRatio,
        t("extend.trade.security_check.values.sell"),
        security?.sellTaxRatio,
      ),
      taxPairCheck(
        "tax_rate",
        t("extend.trade.security_check.values.average"),
        security?.averageTaxRatio,
        t("extend.trade.security_check.values.high"),
        security?.maxTaxRatio,
      ),
      serializedSafetyCheck(security),
    ];
  }

  return [
    flagCheck("no_transfer_fee", security?.hasTransferFee, false),
    flagCheck("fee_not_upgradable", security?.isTransferFeeUpgradable, false),
    flagCheck("transferable", security?.isTransferable, true),
    flagCheck("not_freezable", security?.isFreezable, false),
    flagCheck("not_closable", security?.isClosable, false),
  ];
}

function flagCheck(
  key: string,
  value: boolean | undefined,
  safeWhen: boolean,
): CheckSpec {
  if (value === undefined) return { key, status: "unknown" };
  return { key, status: value === safeWhen ? "safe" : "risk" };
}

function top10Check(ratio: string | undefined): CheckSpec {
  if (!ratio) return { key: "top10", status: "unknown" };
  const status = new SafeBigNumber(ratio).gte(0.1) ? "risk" : "safe";
  return {
    key: "top10",
    status,
    value: formatPercent(ratio),
  };
}

function burnCheck(
  key: string,
  security: TokenSecurityDetails | undefined,
): CheckSpec {
  const burnRatio = getBurnRatio(security);
  if (burnRatio !== undefined) {
    return {
      key,
      status: new SafeBigNumber(burnRatio).gt(0) ? "safe" : "risk",
      value: formatPercent(burnRatio),
    };
  }
  return flagCheck(key, getIsLpBurned(security), true);
}

function formatRatioValue(ratio: string | undefined): string {
  return ratio ? formatPercent(ratio) : "--";
}

function taxPairCheck(
  key: string,
  firstLabel: string,
  firstRatio: string | undefined,
  secondLabel: string,
  secondRatio: string | undefined,
): CheckSpec {
  return {
    key,
    status: "unknown",
    showIcon: false,
    value: (
      <>
        {firstLabel} {formatRatioValue(firstRatio)} / {secondLabel}{" "}
        {formatRatioValue(secondRatio)}
      </>
    ),
  };
}

function serializedSafetyCheck(security: TokenSecurityDetails | undefined): CheckSpec {
  const score =
    security?.serializedCriticalVulnCount ?? security?.serializedVulnCount;
  if (score === undefined && security?.isSerializedSafe === undefined) {
    return { key: "security_score", status: "unknown" };
  }
  return {
    key: "security_score",
    status:
      security?.isSerializedSafe === false || (score ?? 0) > 0
        ? "risk"
        : "safe",
    value: score ?? 0,
  };
}

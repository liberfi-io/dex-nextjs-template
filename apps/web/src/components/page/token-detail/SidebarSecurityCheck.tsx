"use client";

import { useTokenSecurityQuery } from "@liberfi.io/react";
import type { Chain, TokenSecurity } from "@liberfi.io/types";
import {
  CheckIcon,
  Link,
  StyledTooltip,
  XCloseIcon,
  cn,
} from "@liberfi.io/ui";
import { CollapsibleSection } from "@liberfi.io/ui-scaffold";
import { useTranslation } from "@liberfi/ui-base";
import Image from "next/image";
import { useMemo } from "react";

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
  const { data: security } = useTokenSecurityQuery({ chain, address });

  const checks = useMemo<CheckSpec[]>(
    () => buildChecks(security),
    [security],
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
            label={t(`extend.trade.security_check.items.${c.key}`)}
            tooltip={t(`extend.trade.security_check.items.${c.key}_tip`)}
            status={c.status}
          />
        ))}
      </ul>

      <Link
        href={t("extend.trade.security_check.external_link")}
        target="_blank"
        className="mt-3 flex items-center justify-end gap-1.5 text-[12px] text-default-500 transition-colors hover:text-primary-200"
      >
        <Image
          src="/goplus.svg"
          alt="GoPlus"
          width={14}
          height={12}
          className="shrink-0"
        />
        <span>{t("extend.trade.security_check.powered_by")}</span>
      </Link>
    </CollapsibleSection>
  );
}

function CheckRow({
  label,
  tooltip,
  status,
}: {
  label: string;
  tooltip: string;
  status: CheckStatus;
}) {
  return (
    <li className="flex h-7 items-center justify-between gap-2">
      <StyledTooltip content={tooltip} placement="top">
        <span className="cursor-default text-[12px] font-normal text-default-700">
          {label}
        </span>
      </StyledTooltip>
      <StatusIndicator status={status} />
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
function buildChecks(security: TokenSecurity | undefined): CheckSpec[] {
  return [
    flagCheck("no_transfer_fee", security?.hasTransferFee, false),
    flagCheck(
      "fee_not_upgradable",
      security?.isTransferFeeUpgradable,
      false,
    ),
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

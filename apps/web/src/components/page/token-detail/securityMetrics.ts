"use client";

import type { TokenSecurity } from "@liberfi.io/types";
import { SafeBigNumber } from "@liberfi.io/utils";

interface TokenPrivilegeLike {
  address?: string;
  isRenounced?: boolean;
  name?: string;
}

export type TokenSecurityDetails = TokenSecurity & {
  goplus?: {
    raw?: unknown;
    hasBlacklist?: boolean;
    isMintable?: boolean;
  };
  privileges?: TokenPrivilegeLike[];
  devTokenBurnRatio?: string;
  lpBurnRatio?: string;
  isMintAuthorityRenounced?: boolean;
  hasBlacklist?: boolean;
  isLpBurned?: boolean;
  isOpenSource?: boolean;
  isHoneypot?: boolean;
  isOwnershipRenounced?: boolean;
  isLpLocked?: boolean;
  buyTaxRatio?: string;
  sellTaxRatio?: string;
  averageTaxRatio?: string;
  maxTaxRatio?: string;
  isSerializedSafe?: boolean;
  serializedVulnCount?: number;
  serializedCriticalVulnCount?: number;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function firstDefined<T>(...values: Array<T | undefined>): T | undefined {
  return values.find((value) => value !== undefined);
}

function readStatusFlag(value: unknown): boolean | undefined {
  const status = asRecord(value)?.status;
  if (status === "1" || status === 1 || status === true) return true;
  if (status === "0" || status === 0 || status === false) return false;
  return undefined;
}

function readBooleanLike(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return undefined;
}

function readStringLike(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value.toString();
  return undefined;
}

function findMintPrivilege(
  privileges: TokenPrivilegeLike[] | undefined,
): TokenPrivilegeLike | undefined {
  return privileges?.find((privilege) =>
    privilege.name?.toLowerCase().includes("mint"),
  );
}

function getGoPlusRaw(
  security: TokenSecurityDetails | undefined,
): Record<string, unknown> | undefined {
  return asRecord(security?.goplus?.raw);
}

function readRawMaxBurnRatio(raw: Record<string, unknown> | undefined): string | undefined {
  const dex = asArray(raw?.dex);
  if (!dex) return undefined;

  let max: SafeBigNumber | undefined;
  for (const item of dex) {
    const burnPercent = asRecord(item)?.burn_percent;
    const value = readStringLike(burnPercent);
    if (value === undefined) continue;

    const ratio = new SafeBigNumber(value).div(100);
    if (!max || ratio.gt(max)) max = ratio;
  }

  return max?.toString();
}

export function getMintAuthorityRenounced(
  security: TokenSecurityDetails | undefined,
): boolean | undefined {
  const mintPrivilege = findMintPrivilege(security?.privileges);
  const rawMintable = readStatusFlag(getGoPlusRaw(security)?.mintable);
  const goPlusMintable = readBooleanLike(security?.goplus?.isMintable);

  return firstDefined(
    security?.isMintAuthorityRenounced,
    mintPrivilege?.isRenounced,
    rawMintable === undefined ? undefined : !rawMintable,
    goPlusMintable === undefined ? undefined : !goPlusMintable,
  );
}

export function getHasBlacklist(
  security: TokenSecurityDetails | undefined,
): boolean | undefined {
  return firstDefined(security?.hasBlacklist, security?.goplus?.hasBlacklist);
}

export function getBurnRatio(
  security: TokenSecurityDetails | undefined,
): string | undefined {
  return firstDefined(
    security?.devTokenBurnRatio,
    security?.lpBurnRatio,
    readRawMaxBurnRatio(getGoPlusRaw(security)),
  );
}

export function getIsLpBurned(
  security: TokenSecurityDetails | undefined,
): boolean | undefined {
  const burnRatio = getBurnRatio(security);
  return firstDefined(
    security?.isLpBurned,
    burnRatio === undefined ? undefined : new SafeBigNumber(burnRatio).gt(0),
  );
}

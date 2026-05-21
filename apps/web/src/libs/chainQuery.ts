import { Chain } from "@liberfi.io/types";
import { CHAIN_REGISTRY, chainSlug } from "@liberfi.io/utils";

/**
 * Canonical URL query value for a chain.
 *
 * Prefers the registered abbreviation (e.g. `eth` / `bsc` / `sol`) for a
 * compact, human-friendly query parameter, falling back to the full slug
 * (e.g. `polygon`) when no abbreviation is defined.
 *
 * The inverse — query value → chain — is handled by
 * `chainIdBySlug` (from `@liberfi.io/utils`), which already accepts both
 * abbreviations and slugs case-insensitively.
 */
export function chainQueryValue(chain: Chain): string | undefined {
  return CHAIN_REGISTRY[chain]?.abbr ?? chainSlug(chain);
}

/**
 * Adds the `chain` query parameter to a URL, preserving any existing query
 * parameters. If the URL already has a `chain` param, it is left unchanged.
 *
 * Accepts both absolute (`/path?x=1`) and root-relative (`path`) forms; the
 * leading prefix is preserved as-is.
 *
 * Skips routes whose path already encodes the chain (`/tokens/{slug}/...`).
 * Adding a (possibly stale) `?chain=` there would either be redundant — if
 * it matches the path — or trigger a redirect loop via `useChainUrlSync` —
 * if it does not.
 */
export function withChainQuery(href: string, chain: string): string {
  // Skip external links and anchors that don't represent a router navigation.
  if (
    !href ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }

  const [beforeHash, hash = ""] = href.split("#");
  const [pathname, search = ""] = beforeHash.split("?");

  // Routes where the path itself encodes the chain own the chain context;
  // never inject the query here.
  if (pathname.startsWith("/tokens/")) return href;

  const params = new URLSearchParams(search);
  if (params.has("chain")) return href;
  params.set("chain", chain);

  const queryString = params.toString();
  const hashSuffix = hash ? `#${hash}` : "";
  return `${pathname}${queryString ? `?${queryString}` : ""}${hashSuffix}`;
}

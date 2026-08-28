import legacyEn from "@liberfi/locales/en";
import legacyZh from "@liberfi/locales/zh";
import { SDK_DOMAIN_LOCALE_ROOTS } from "./roots";

type LegacyResource = { extend: Record<string, unknown> };

/**
 * Unpublished SDK i18n still omits some canonical domain copy. Until that
 * package is published, read those roots from the leftover locales package
 * as top-level SDK-shaped keys — never as application `extend` resources.
 */
function sdkShapedDomain(resource: LegacyResource) {
  return Object.fromEntries(
    SDK_DOMAIN_LOCALE_ROOTS.filter((root) => resource.extend[root] !== undefined).map((root) => [
      root,
      resource.extend[root],
    ]),
  );
}

export const legacySdkShapedDomainResources = {
  en: sdkShapedDomain(legacyEn),
  zh: sdkShapedDomain(legacyZh),
};

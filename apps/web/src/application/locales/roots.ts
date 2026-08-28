/** Shell/nav/brand copy owned by the application, not the SDK. */
export const APPLICATION_LOCALE_ROOTS = [
  "title",
  "description",
  "languages",
  "header",
  "footer",
  "auth",
  "network",
  "nav",
  "toolbar",
  "settings",
  "common",
  "search",
] as const;

/** SDK-owned domain copy. Must not appear in application locale files. */
export const SDK_DOMAIN_LOCALE_ROOTS = [
  "token_list",
  "trade",
  "account",
  "redpacket",
  "launchpad",
  "pulse",
  "predict",
  "hlDeposit",
  "perpetuals",
  "portfolio",
] as const;

export type ApplicationLocaleRoot = (typeof APPLICATION_LOCALE_ROOTS)[number];
export type SdkDomainLocaleRoot = (typeof SDK_DOMAIN_LOCALE_ROOTS)[number];

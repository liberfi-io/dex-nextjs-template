interface AliasRuntime {
  i18n: {
    getResourceBundle(locale: string, namespace: string): unknown;
    addResourceBundle(locale: string, namespace: string, resources: unknown, deep: boolean, overwrite: boolean): void;
  };
}

const domainRoots = [
  "token_list", "trade", "account", "redpacket", "launchpad", "pulse",
  "predict", "hlDeposit", "perpetuals", "portfolio",
] as const;

/** Promote legacy template resources only when the installed SDK predates LocaleRuntime. */
export function legacySdkCompatibilityResource<
  TResource extends { extend: Record<string, unknown> },
>(resource: TResource) {
  return {
    ...resource,
    ...Object.fromEntries(
      domainRoots.map((root) => [root, resource.extend[root]]),
    ),
  };
}

/** Install stage-6 compatibility aliases that reference SDK-owned resources. */
export function installLegacyLocaleAliases(runtime: AliasRuntime, locale: string) {
  const bundle = runtime.i18n.getResourceBundle(locale, "translation") as Record<string, unknown> | undefined;
  if (!bundle) return;
  const extend: Record<string, unknown> = {};
  for (const root of domainRoots) {
    if (bundle[root] !== undefined) extend[root] = bundle[root];
  }
  runtime.i18n.addResourceBundle(locale, "translation", { extend }, true, true);
}

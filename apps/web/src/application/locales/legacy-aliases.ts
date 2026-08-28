import { SDK_DOMAIN_LOCALE_ROOTS } from "./roots";

interface AliasRuntime {
  i18n: {
    getResourceBundle(locale: string, namespace: string): unknown;
    addResourceBundle(
      locale: string,
      namespace: string,
      resources: unknown,
      deep: boolean,
      overwrite: boolean,
    ): void;
  };
}

/**
 * Project SDK-owned domain roots onto `extend.*` for leftover template keys.
 * Does not copy those roots into application locale files.
 */
export function installLegacyLocaleAliases(runtime: AliasRuntime, locale: string) {
  const bundle = runtime.i18n.getResourceBundle(locale, "translation") as
    | Record<string, unknown>
    | undefined;
  if (!bundle) return;
  const extend: Record<string, unknown> = {};
  for (const root of SDK_DOMAIN_LOCALE_ROOTS) {
    if (bundle[root] !== undefined) extend[root] = bundle[root];
  }
  runtime.i18n.addResourceBundle(locale, "translation", { extend }, true, true);
}

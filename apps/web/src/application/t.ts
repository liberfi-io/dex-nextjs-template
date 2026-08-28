/**
 * Call SDK i18n `t()` with a runtime key. Unpublished typed dictionaries
 * reject `string`; leftover table/security copy still builds keys at runtime.
 */
export function tKey(
  t: (...args: never[]) => unknown,
  key: string,
  options?: Record<string, unknown>,
): string {
  return String((t as (k: string, o?: Record<string, unknown>) => unknown)(key, options));
}

import {
  createLocaleRuntime,
  type LocaleCode,
  type LocaleRuntime,
} from "@liberfi.io/i18n";
import { tradeErrorMessages } from "./trade-error-messages";

export type ApplicationLocaleRuntime = LocaleRuntime;

export function applicationLocaleProviderProps(runtime: ApplicationLocaleRuntime) {
  return { runtime };
}

/** Create one application-owned locale runtime for a layout root. */
export function createApplicationLocaleRuntime(locale: LocaleCode) {
  return createLocaleRuntime({ locale, resources: tradeErrorMessages });
}

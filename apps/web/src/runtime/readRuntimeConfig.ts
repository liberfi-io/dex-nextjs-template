import { RuntimeConfig, RuntimeEnvironment } from "./app-runtime.types";
import { resolveRuntimeConfigPolicy } from "./runtime-lifecycle-policy";

function readBrowserOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function readRuntimeConfig(
  env: RuntimeEnvironment = process.env,
  origin: string = readBrowserOrigin(),
): RuntimeConfig {
  return resolveRuntimeConfigPolicy({ env, origin });
}

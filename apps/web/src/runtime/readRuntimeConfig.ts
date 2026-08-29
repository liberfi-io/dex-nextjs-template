import { RuntimeConfig, RuntimeEnvironment } from "./app-runtime.types";
import { resolveRuntimeConfigPolicy } from "./runtime-lifecycle-policy";

function readBrowserOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

/**
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` when the member
 * expression is static. Passing `process.env` through as an object leaves
 * the client bundle with the browser `process` shim (`env = {}`) and
 * hydration throws `Missing required runtime variable`.
 */
function readPublicRuntimeEnv(): RuntimeEnvironment {
  return {
    NEXT_PUBLIC_DEX_AGGREGATOR_URL: process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL,
    NEXT_PUBLIC_MEDIA_TRACK_URL: process.env.NEXT_PUBLIC_MEDIA_TRACK_URL,
    NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL: process.env.NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL,
    NEXT_PUBLIC_CHANNELS_URL: process.env.NEXT_PUBLIC_CHANNELS_URL,
    NEXT_PUBLIC_PREDICT_URL: process.env.NEXT_PUBLIC_PREDICT_URL,
    NEXT_PUBLIC_ENABLE_PREDICT_WS: process.env.NEXT_PUBLIC_ENABLE_PREDICT_WS,
    NEXT_PUBLIC_PREDICT_WS_URL: process.env.NEXT_PUBLIC_PREDICT_WS_URL,
    NEXT_PUBLIC_PERPETUALS_API_PATH: process.env.NEXT_PUBLIC_PERPETUALS_API_PATH,
  };
}

export function readRuntimeConfig(
  env: RuntimeEnvironment = readPublicRuntimeEnv(),
  origin: string = readBrowserOrigin(),
): RuntimeConfig {
  return resolveRuntimeConfigPolicy({ env, origin });
}

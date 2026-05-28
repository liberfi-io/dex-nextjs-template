import * as Sentry from "@sentry/nextjs";
import { isSentryEnabled } from "./sentry.shared";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = isSentryEnabled()
  ? Sentry.captureRequestError
  : () => undefined;

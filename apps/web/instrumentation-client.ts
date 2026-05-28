import * as Sentry from "@sentry/nextjs";
import type { Event, EventHint } from "@sentry/nextjs";

function getErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== "object") return [];

  const messages: string[] = [];
  const maybeError = error as { message?: unknown; name?: unknown; cause?: unknown };

  if (typeof maybeError.name === "string") messages.push(maybeError.name);
  if (typeof maybeError.message === "string") messages.push(maybeError.message);
  messages.push(...getErrorMessages(maybeError.cause));

  return messages;
}

function isMetaMaskSessionRestoreError(event: Event, hint: EventHint): boolean {
  const exceptionValues = event.exception?.values ?? [];
  const breadcrumbs = event.breadcrumbs ?? [];
  const originalErrorMessages = getErrorMessages(hint.originalException);

  const searchableText = [
    event.message,
    event.logger,
    ...originalErrorMessages,
    ...exceptionValues.flatMap((value) => [
      value.type,
      value.value,
      ...(value.stacktrace?.frames ?? []).flatMap((frame) => [
        frame.filename,
        frame.function,
      ]),
    ]),
    ...breadcrumbs.flatMap((breadcrumb) => [
      breadcrumb.category,
      breadcrumb.message,
      ...(Array.isArray(breadcrumb.data?.arguments) ? breadcrumb.data.arguments : []),
    ]),
  ]
    .filter((value): value is string => typeof value === "string")
    .join("\n");

  return (
    searchableText.includes("Error restoring session") &&
    searchableText.includes("Failed to connect to MetaMask") &&
    (event.logger === "console" || searchableText.includes("chrome-extension://"))
  );
}

Sentry.init({
  dsn: "https://8399a4a467261ee93083332b735f28a7@o4508794425966592.ingest.de.sentry.io/4509219864248400",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // Replay may only be enabled for the client-side
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  beforeSend(event, hint) {
    if (isMetaMaskSessionRestoreError(event, hint)) return null;
    return event;
  },
});

// This export will instrument router navigations, and is only relevant if you enable tracing.
// `captureRouterTransitionStart` is available from SDK version 9.12.0 onwards
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

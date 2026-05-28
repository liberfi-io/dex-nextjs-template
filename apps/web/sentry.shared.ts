export function isSentryEnabled() {
  return process.env.NODE_ENV !== "development";
}

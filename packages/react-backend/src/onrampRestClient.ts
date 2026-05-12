/**
 * REST client for the dex-server `/api/onramp/*` endpoints.
 *
 * Mirrors the layering used by `transferRestClient.ts`: a thin fetch
 * helper that normalises non-2xx responses into a typed `OnrampApiError`,
 * with the React Query hook sitting on top in
 * `useCreateOnrampWidgetUrlMutation`.
 *
 * The dex-server speaks the strategy pattern internally — the request
 * carries a `provider` name and the server routes it to the matching
 * gateway (Transak today, MoonPay/AlchemyPay tomorrow). The browser
 * therefore stays provider-agnostic; if a request needs provider-specific
 * widgetParams, build them in the calling hook, not here.
 */

/**
 * Base path for the dex-server onramp routes. Goes through the Next.js
 * `/dex-tx-api/*` rewrite (configured in `next.config.mjs` →
 * `${DEX_SERVER_URL}/api/onramp/*`).
 */
export const ONRAMP_API_BASE = "/dex-tx-api/onramp";

/**
 * Request body of `POST /api/onramp/widget-url`.
 *
 * `provider` is optional; when omitted the dex-server uses its configured
 * default provider (`onramp.default_provider` in `configs/config.yaml`).
 * `widgetParams` is forwarded to the provider's `create-widget-url` call
 * essentially verbatim — the server injects `apiKey` and `referrerDomain`
 * server-side, so callers MUST NOT include those fields.
 */
export interface CreateOnrampWidgetUrlBody {
  provider?: string;
  widgetParams: Record<string, unknown>;
}

/**
 * Response shape returned by the dex-server. Mirrors
 * `domain.CreateWidgetURLResponse`.
 *
 * `expiresAt` is a unix-seconds timestamp; for Transak the widget URL
 * itself is single-use and lives for ~5 minutes, so callers should either
 * open it immediately or regenerate after expiry.
 */
export interface CreateOnrampWidgetUrlResult {
  provider: string;
  widgetUrl: string;
  expiresAt?: number;
}

/**
 * Error thrown when the dex-server onramp endpoint returns a non-2xx
 * response. The `code` is the structured error key (e.g. `bad_request`,
 * `provider_unavailable`); `message` is the human-readable explanation
 * the server provides.
 */
export class OnrampApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "OnrampApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * POST `/dex-tx-api/onramp/widget-url`.
 *
 * Parses both success and error responses as JSON and throws a typed
 * `OnrampApiError` on non-2xx so callers can branch on `error.code`
 * (e.g. show a "provider unavailable" message when `provider_unavailable`).
 */
export async function createOnrampWidgetUrl(
  body: CreateOnrampWidgetUrlBody,
  signal?: AbortSignal,
): Promise<CreateOnrampWidgetUrlResult> {
  const res = await fetch(`${ONRAMP_API_BASE}/widget-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const obj = (parsed ?? {}) as { error?: string; message?: string };
    throw new OnrampApiError(
      res.status,
      obj.error ?? "onramp_failed",
      obj.message ?? `Request failed with status ${res.status}`,
    );
  }
  return parsed as CreateOnrampWidgetUrlResult;
}

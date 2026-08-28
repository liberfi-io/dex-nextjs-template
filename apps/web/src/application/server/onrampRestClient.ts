export const ONRAMP_API_BASE = "/dex-tx-api/onramp";

export interface CreateOnrampWidgetUrlBody {
  provider?: string;
  widgetParams: Record<string, unknown>;
}

export interface CreateOnrampWidgetUrlResult {
  provider: string;
  widgetUrl: string;
  expiresAt?: number;
}

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

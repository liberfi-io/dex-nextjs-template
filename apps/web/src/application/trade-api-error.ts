export type TradeApiErrorKind =
  | "insufficient_balance"
  | "insufficient_liquidity"
  | "slippage"
  | "price_impact"
  | "no_route"
  | "amount_invalid"
  | "same_token"
  | "tx_rejected"
  | "tx_expired"
  | "network"
  | "unauthorized"
  | "rate_limit"
  | "unknown";

export type ParsedTradeApiError = {
  rawMessage: string;
  httpStatus?: number;
  code?: number;
  apiMessage?: string;
  detailsText: string;
  kind: TradeApiErrorKind;
};

const SDK_WRAPPER_PATTERN = /^ChainStream API error \((\d+)\):\s*/i;
const PHASE_PREFIX_PATTERN = /^(?:Route|Sign|Send|Expired|Confirm) failed:\s*/i;
const BALANCE_DETAIL_CODES = new Set([50006, 50011, 50012, 50026]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeField(record: Record<string, unknown>, key: string): unknown {
  try {
    return record[key];
  } catch {
    return undefined;
  }
}

function safeString(value: unknown): string {
  try {
    return String(value ?? "");
  } catch {
    return "";
  }
}

function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 280);
}

function flattenDetails(value: unknown): string {
  const seen = new WeakSet<object>();

  const visit = (current: unknown, depth: number): string[] => {
    if (current == null || depth > 3) return [];
    if (typeof current === "string") {
      const text = compactText(current);
      if (!text) return [];
      if (text.startsWith("{") || text.startsWith("[")) {
        try {
          return visit(JSON.parse(text), depth + 1);
        } catch {
          return [text];
        }
      }
      return [text];
    }
    if (typeof current === "number" || typeof current === "boolean") {
      return [String(current)];
    }
    if (!isRecord(current) || seen.has(current)) return [];
    seen.add(current);

    for (const key of ["detail", "message", "reason", "error"]) {
      const preferred = visit(safeField(current, key), depth + 1);
      if (preferred.length > 0) return preferred;
    }

    try {
      return Object.values(current)
        .flatMap((entry) => visit(entry, depth + 1))
        .slice(0, 3);
    } catch {
      return [];
    }
  };

  return compactText(visit(value, 0).join(" · "));
}

function extractJsonBody(text: string): Record<string, unknown> | undefined {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return undefined;

  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function numericField(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? compactText(value) : undefined;
}

function looksLikeInsufficientBalance(text: string): boolean {
  const normalized = text.toLowerCase();
  if (!normalized || normalized.includes("insufficient liquidity")) return false;
  return (
    normalized.includes("insufficient funds") ||
    normalized.includes("insufficient balance") ||
    normalized.includes("insufficient lamports") ||
    normalized.includes("intrinsic transaction cost") ||
    normalized.includes("insufficient native") ||
    normalized.includes("gas required exceeds")
  );
}

function looksLikeNoRoute(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("no route") ||
    normalized.includes("route not found") ||
    normalized.includes("no available route") ||
    (normalized.includes("cannot find") && normalized.includes("route"))
  );
}

function looksLikeSlippage(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("slippage") ||
    normalized.includes("price moved") ||
    normalized.includes("0x1771")
  );
}

function classifyError(input: {
  rawMessage: string;
  httpStatus?: number;
  code?: number;
  apiMessage?: string;
  detailsText: string;
  messageText: string;
}): TradeApiErrorKind {
  const { rawMessage, httpStatus, code, apiMessage = "", detailsText, messageText } = input;
  const searchable = `${apiMessage} ${detailsText} ${messageText}`.trim();

  if (
    code === 50017 ||
    ((code === undefined || BALANCE_DETAIL_CODES.has(code)) &&
      looksLikeInsufficientBalance(searchable))
  ) {
    return "insufficient_balance";
  }
  if (code === 40006 || searchable.toLowerCase().includes("insufficient liquidity")) {
    return "insufficient_liquidity";
  }
  if (code === 40008 || code === 40019 || looksLikeSlippage(searchable)) {
    return "slippage";
  }
  if (code === 40007) return "price_impact";
  if (code === 40017) return "same_token";
  if (code === 40014 || code === 40015 || code === 40016 || code === 40018) {
    return "amount_invalid";
  }
  if (code === 40010 || code === 40011 || code === 40012) return "tx_rejected";
  if (code === 50004 || code === 50022) return "tx_expired";
  if (code === 50010 || code === 50035 || code === 50009 || looksLikeNoRoute(searchable)) {
    return "no_route";
  }
  if (code === 401 || code === 40003 || httpStatus === 401) return "unauthorized";
  if (code === 429 || code === 42901 || httpStatus === 429) return "rate_limit";
  if (/network|timeout|econn|failed to fetch|axios/i.test(rawMessage)) return "network";
  return "unknown";
}

export function parseTradeApiError(error: unknown): ParsedTradeApiError {
  const errorRecord = isRecord(error) ? error : undefined;
  const directBody =
    errorRecord &&
    (safeField(errorRecord, "code") !== undefined ||
      safeField(errorRecord, "details") !== undefined)
      ? errorRecord
      : undefined;
  const recordMessage = errorRecord
    ? stringField(safeField(errorRecord, "message"))
    : undefined;
  const rawMessage =
    typeof error === "string" ? error : (recordMessage ?? safeString(error));

  let unwrapped = rawMessage.trim();
  while (PHASE_PREFIX_PATTERN.test(unwrapped)) {
    unwrapped = unwrapped.replace(PHASE_PREFIX_PATTERN, "");
  }

  let httpStatus =
    (directBody
      ? numericField(safeField(directBody, "httpStatus")) ??
        numericField(safeField(directBody, "status")) ??
        numericField(safeField(directBody, "statusCode"))
      : undefined);
  const wrapper = unwrapped.match(SDK_WRAPPER_PATTERN);
  if (wrapper) {
    httpStatus = Number(wrapper[1]);
    unwrapped = unwrapped.slice(wrapper[0].length).trim();
  }

  const body = directBody ?? extractJsonBody(unwrapped);
  const code = body ? numericField(safeField(body, "code")) : undefined;
  const apiMessage = body ? stringField(safeField(body, "message")) : undefined;
  const detailsText = body ? flattenDetails(safeField(body, "details")) : "";
  const kind = classifyError({
    rawMessage,
    httpStatus,
    code,
    apiMessage,
    detailsText,
    messageText: unwrapped,
  });

  return { rawMessage, httpStatus, code, apiMessage, detailsText, kind };
}

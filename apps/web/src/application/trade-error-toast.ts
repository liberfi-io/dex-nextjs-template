import type { SwapPhase } from "@liberfi.io/ui-trade";
import { parseTradeApiError, type TradeApiErrorKind } from "./trade-api-error";

const MESSAGE_KEY_BY_KIND = {
  insufficient_balance: "trade.insufficientBalance",
  insufficient_liquidity: "extend.trade.error.insufficientLiquidity",
  slippage: "extend.trade.error.slippage",
  price_impact: "extend.trade.error.priceImpact",
  no_route: "extend.trade.error.noRoute",
  amount_invalid: "extend.trade.error.invalidAmount",
  same_token: "extend.trade.error.sameToken",
  tx_rejected: "extend.trade.error.txRejected",
  tx_expired: "extend.trade.error.txExpired",
  network: "extend.trade.error.network",
  unauthorized: "extend.trade.error.unauthorized",
  rate_limit: "extend.trade.error.rateLimit",
} as const satisfies Record<Exclude<TradeApiErrorKind, "unknown">, string>;

type TradeErrorMessageKey =
  | (typeof MESSAGE_KEY_BY_KIND)[keyof typeof MESSAGE_KEY_BY_KIND]
  | "extend.trade.error.unknown";

export type TradeErrorTranslator = (key: TradeErrorMessageKey) => string;

export function getTradeErrorToastMessage(
  error: Error,
  phase: SwapPhase,
  t: TradeErrorTranslator,
): string {
  const parsed = parseTradeApiError(error);
  const kind = parsed.kind === "unknown" && phase === "expired" ? "tx_expired" : parsed.kind;

  if (kind !== "unknown") return t(MESSAGE_KEY_BY_KIND[kind]);
  if (parsed.detailsText) return parsed.detailsText;
  return t("extend.trade.error.unknown");
}

import type { Resources } from "@liberfi.io/i18n";

export const tradeErrorMessages = {
  en: {
    "extend.trade.error.insufficientLiquidity": "Insufficient liquidity",
    "extend.trade.error.slippage": "Slippage too high. Try increasing slippage.",
    "extend.trade.error.priceImpact": "Price impact too high",
    "extend.trade.error.noRoute": "No available swap route",
    "extend.trade.error.invalidAmount": "Invalid amount",
    "extend.trade.error.sameToken": "Cannot swap a token for itself",
    "extend.trade.error.txRejected": "Transaction rejected",
    "extend.trade.error.txExpired": "Quote expired. Please retry.",
    "extend.trade.error.network": "Network error. Please try again.",
    "extend.trade.error.unauthorized": "Session expired. Please sign in again.",
    "extend.trade.error.rateLimit": "Too many requests. Please wait and try again.",
    "extend.trade.error.unknown": "Transaction failed. Please try again.",
  },
  zh: {
    "extend.trade.error.insufficientLiquidity": "流動性不足",
    "extend.trade.error.slippage": "滑點過大，請調高滑點後重試",
    "extend.trade.error.priceImpact": "價格影響過大",
    "extend.trade.error.noRoute": "暫無可用兌換路徑",
    "extend.trade.error.invalidAmount": "數量無效",
    "extend.trade.error.sameToken": "不能兌換相同代幣",
    "extend.trade.error.txRejected": "交易被拒絕",
    "extend.trade.error.txExpired": "報價已過期，請重試",
    "extend.trade.error.network": "網路異常，請稍後重試",
    "extend.trade.error.unauthorized": "登入已失效，請重新登入",
    "extend.trade.error.rateLimit": "請求過於頻繁，請稍後再試",
    "extend.trade.error.unknown": "交易失敗，請稍後重試",
  },
} satisfies Resources;

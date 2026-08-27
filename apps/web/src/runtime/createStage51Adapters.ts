import type { Client } from "@liberfi.io/client";
import { SwapMode, type Chain, type SwapRoute } from "@liberfi.io/types";

export interface Stage51TradeIntent {
  chain: Chain;
  userAddress: string;
  input: string;
  output: string;
  amount: string;
  mode?: SwapMode;
  slippage?: number;
  priorityFee?: string;
  tipFee?: string;
  isAntiMev?: boolean;
  permit?: string;
  deadline?: number;
}

export interface Stage51TradeAdapter {
  quote: (intent: Stage51TradeIntent) => Promise<SwapRoute>;
  getLatestBlock: (chain: Chain) => ReturnType<Client["getLatestBlock"]>;
  submit: (
    signedBase64: string,
    chain: Chain,
  ) => ReturnType<Client["sendTx"]>;
  confirm: (
    chain: Chain,
    txHash: string,
  ) => Promise<"confirmed" | "failed">;
}

export interface Stage51Adapters {
  tradeAdapter: Stage51TradeAdapter;
}

/** Application Adapter for Stage 5.1 trade execution. Token market uses DexClient. */
export function createStage51TradeAdapter(api: Client): Stage51TradeAdapter {
  return {
    quote: (intent) =>
      api.swapRoute({
        chain: intent.chain,
        userAddress: intent.userAddress,
        input: intent.input,
        output: intent.output,
        mode: intent.mode ?? SwapMode.EXACT_IN,
        amount: intent.amount,
        slippage: intent.slippage,
        priorityFee: intent.priorityFee,
        tipFee: intent.tipFee,
        isAntiMev: intent.isAntiMev,
        permit: intent.permit,
        deadline: intent.deadline,
      }),
    getLatestBlock: (chain) => api.getLatestBlock({ chain }),
    submit: (signedBase64, chain) =>
      api.sendTx({ chain, serializedTx: signedBase64 }),
    confirm: async (chain, txHash) => {
      const success = await api.checkTxSuccess(chain, txHash);
      return success ? "confirmed" : "failed";
    },
  };
}

export function createStage51Adapters(api: Client): Stage51Adapters {
  return {
    tradeAdapter: createStage51TradeAdapter(api),
  };
}

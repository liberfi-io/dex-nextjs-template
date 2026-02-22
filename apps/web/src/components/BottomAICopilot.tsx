"use client";

import { useResizeObserver } from "@liberfi.io/hooks";
// import { Chain, SOL_TOKEN_DECIMALS } from "@liberfi/core";
// import { fetchToken, useDexClient } from "@liberfi/react-dex";
// import { useAuth, useTranslation } from "@liberfi/ui-base";
import { ChatWidget, AgentProvider } from "@agent-widget/react";
import { useRef } from "react";
// import { toast } from "@liberfi.io/ui";
// import { useSwap } from "@liberfi/ui-dex";
// import { SafeBigNumber } from "@liberfi.io/utils";

export function BottomAICopilot() {
  // const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);

  const size = useResizeObserver({ ref });

  // const { status, signIn } = useAuth();

  // const dexClient = useDexClient();

  // const { swap } = useSwap();

  // const handleTradeEvent = useCallback(
  //   async (event: TradeEvent) => {
  //     if (status !== "authenticated") {
  //       signIn();
  //       return;
  //     }
  //     const { from, to, amount } = event.data;

  //     try {
  //       const fromToken = await fetchToken(dexClient, Chain.SOLANA, from);
  //       if (!fromToken || !fromToken.address) {
  //         toast.error(t("extend.account.convert_errors.token_not_found", { address: from }));
  //         return;
  //       }

  //       const toToken = await fetchToken(dexClient, Chain.SOLANA, to);
  //       if (!toToken || !toToken.address) {
  //         toast.error(t("extend.account.convert_errors.token_not_found", { address: to }));
  //         return;
  //       }

  //       const amountInDecimals = new SafeBigNumber(amount).shiftedBy(fromToken.decimals).toString();

  //       await swap({
  //         from,
  //         to,
  //         amount: amountInDecimals,
  //         slippage: 20,
  //         priorityFee: new SafeBigNumber(0.001).shiftedBy(SOL_TOKEN_DECIMALS).toString(),
  //         tipFee: new SafeBigNumber(0.001).shiftedBy(SOL_TOKEN_DECIMALS).toString(),
  //         isAntiMev: false,
  //       });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  //   [status, signIn, dexClient, t, swap],
  // );

  // const handleEvent = useCallback(
  //   (event: ChatWidgetEvent) => {
  //     switch (event.type) {
  //       case "trade":
  //         handleTradeEvent(event);
  //         break;
  //       default:
  //         break;
  //     }
  //   },
  //   [handleTradeEvent],
  // );

  return (
    <div className="w-full h-full agui-chat-widget-container" ref={ref}>
      <AgentProvider appRuntimeUrl={process.env.NEXT_PUBLIC_AI_COPILOT_URL}>
        <ChatWidget theme="dark" width={`${size.width}px`} height={`${size.height}px`} />
      </AgentProvider>
    </div>
  );
}

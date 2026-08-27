import type { Client } from "@liberfi.io/client";
import { Chain } from "@liberfi.io/types";
import { createStage51TradeAdapter } from "../createStage51Adapters";

describe("createStage51TradeAdapter", () => {
  it("quotes through the application Client", async () => {
    const route = {
      serializedTx: "dW5zaWduZWQtdHg=",
      lastValidBlockHeight: 1_090,
      plans: [],
    };
    const api = {
      swapRoute: jest.fn().mockResolvedValue(route),
      sendTx: jest.fn(),
      getLatestBlock: jest.fn(),
      checkTxSuccess: jest.fn(),
    } as unknown as Client;

    const adapter = createStage51TradeAdapter(api);
    const quoted = await adapter.quote({
      chain: Chain.SOLANA,
      userAddress: "wallet",
      input: "in",
      output: "out",
      amount: "1",
    });

    expect(api.swapRoute).toHaveBeenCalledTimes(1);
    expect(quoted).toEqual(route);
  });
});

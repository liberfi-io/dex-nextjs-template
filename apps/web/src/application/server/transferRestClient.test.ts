import { Chain } from "@liberfi.io/types";
import {
  TRANSFER_API_BASE,
  TransferApiError,
  chainToTransferSymbol,
  getTransferStatus,
  isTerminalTransferStatus,
} from "./transferRestClient";
import { createTransferTransaction as createTx } from "./useCreateTransferTransactionMutation";
import { sendTransferTransaction as sendTx } from "./useSendTransferTransactionMutation";

describe("application transfer REST adapter", () => {
  it("maps SDK chains onto dex-server path symbols", () => {
    expect(chainToTransferSymbol(Chain.SOLANA)).toBe("sol");
    expect(chainToTransferSymbol(Chain.ETHEREUM)).toBe("eth");
    expect(chainToTransferSymbol(Chain.BINANCE)).toBe("bsc");
  });

  it("treats success and failed as terminal statuses", () => {
    expect(isTerminalTransferStatus("success")).toBe(true);
    expect(isTerminalTransferStatus("failed")).toBe(true);
    expect(isTerminalTransferStatus("pending")).toBe(false);
    expect(isTerminalTransferStatus("not_found")).toBe(false);
  });

  it("builds an unsigned transfer through the Next rewrite", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ serializedTx: "dHhieXRlcw==" }),
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;
    try {
      const result = await createTx({
        chain: Chain.SOLANA,
        sourceAddress: "from",
        destinationAddress: "to",
        amount: "1000",
      });
      expect(fetchMock).toHaveBeenCalledWith(`${TRANSFER_API_BASE}/sol/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceAddress: "from",
          destinationAddress: "to",
          amount: "1000",
        }),
        signal: undefined,
      });
      expect(result).toEqual({ serializedTx: "dHhieXRlcw==" });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("broadcasts a signed transfer and polls status", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ txSignature: "sig-1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success" }),
      });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;
    try {
      await expect(sendTx({ chain: Chain.SOLANA, signedTx: "signed" })).resolves.toEqual({
        txSignature: "sig-1",
      });
      await expect(getTransferStatus("sol", "sig-1")).resolves.toEqual({ status: "success" });
      expect(fetchMock).toHaveBeenNthCalledWith(2, `${TRANSFER_API_BASE}/sol/status/sig-1`, {
        method: "GET",
        signal: undefined,
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("throws TransferApiError on non-2xx", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "bad_request", message: "amount too small" }),
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;
    try {
      await expect(
        createTx({
          chain: Chain.SOLANA,
          sourceAddress: "from",
          destinationAddress: "to",
          amount: "0",
        }),
      ).rejects.toEqual(expect.any(TransferApiError));
    } finally {
      global.fetch = originalFetch;
    }
  });
});

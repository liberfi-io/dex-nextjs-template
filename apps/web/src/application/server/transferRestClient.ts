import { Chain } from "@liberfi.io/types";

export type TransferChainSymbol = "sol" | "eth" | "bsc";

export function chainToTransferSymbol(chain: Chain): TransferChainSymbol | undefined {
  switch (chain) {
    case Chain.SOLANA:
      return "sol";
    case Chain.ETHEREUM:
      return "eth";
    case Chain.BINANCE:
      return "bsc";
    default:
      return undefined;
  }
}

export const TRANSFER_API_BASE = "/dex-tx-api/tx/transfer";

export class TransferApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "TransferApiError";
    this.status = status;
    this.code = code;
  }
}

export async function postTransfer<TReq, TRes>(
  chain: TransferChainSymbol,
  action: "build" | "send",
  body: TReq,
  signal?: AbortSignal,
): Promise<TRes> {
  const res = await fetch(`${TRANSFER_API_BASE}/${chain}/${action}`, {
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
    throw new TransferApiError(
      res.status,
      obj.error ?? "transfer_failed",
      obj.message ?? `Request failed with status ${res.status}`,
    );
  }
  return parsed as TRes;
}

export type TransferStatus = "pending" | "success" | "failed" | "not_found";

export interface TransferStatusResponse {
  status: TransferStatus;
  error?: string;
  confirmations?: number;
  blockNumber?: number;
}

export function isTerminalTransferStatus(s: TransferStatus): boolean {
  return s === "success" || s === "failed";
}

export async function getTransferStatus(
  chain: TransferChainSymbol,
  signature: string,
  signal?: AbortSignal,
): Promise<TransferStatusResponse> {
  const url = `${TRANSFER_API_BASE}/${chain}/status/${encodeURIComponent(signature)}`;
  const res = await fetch(url, { method: "GET", signal });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const obj = (parsed ?? {}) as { error?: string; message?: string };
    throw new TransferApiError(
      res.status,
      obj.error ?? "transfer_status_failed",
      obj.message ?? `Request failed with status ${res.status}`,
    );
  }
  return parsed as TransferStatusResponse;
}

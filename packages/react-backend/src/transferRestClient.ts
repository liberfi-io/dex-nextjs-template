import { Chain } from "@liberfi.io/types";

/**
 * Backend `chain` path-parameter values. Mirrors the constants exposed by
 * `dex-server/internal/domain.Chain*`. Keep this in sync if the server
 * ever adds or renames a chain.
 */
export type TransferChainSymbol = "sol" | "eth" | "bsc";

/**
 * Map the SDK `Chain` enum (chainId string) to the lowercase symbol the
 * dex-server transfer endpoints expect. Returns `undefined` for chains
 * the server has not yet implemented; callers MUST handle that case
 * before issuing a request.
 */
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

/**
 * Base path for the dex-server transfer routes. Goes through the Next.js
 * `/dex-tx-api/*` rewrite (configured in `next.config.mjs`).
 */
export const TRANSFER_API_BASE = "/dex-tx-api/tx/transfer";

/**
 * Error thrown when the dex-server REST endpoint returns a non-2xx
 * response. The `code` is the structured error key (e.g. `bad_request`,
 * `chain_unavailable`); `message` is the human-readable explanation
 * the server provides.
 *
 * Surfacing both fields lets callers decide whether to render the raw
 * message (default) or branch on the code (e.g. show a "switch network"
 * CTA when `code === "chain_unavailable"`).
 */
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

/**
 * Thin POST helper that:
 *   1. Issues a JSON request to `${TRANSFER_API_BASE}/{chain}/{action}`.
 *   2. Parses the JSON body for both success and error responses.
 *   3. Throws a typed `TransferApiError` on non-2xx, mirroring the
 *      backend's `{ error, message }` shape.
 *
 * Centralising fetch + error normalisation here keeps each hook focused
 * on its specific request/response types.
 */
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

// ---------------------------------------------------------------------------
// Status polling
// ---------------------------------------------------------------------------

/**
 * Mirrors `dex-server/internal/domain.TxStatus*` constants. Frontends only
 * need to branch on terminal vs. non-terminal; helpers are exported below.
 */
export type TransferStatus = "pending" | "success" | "failed" | "not_found";

/**
 * Response shape of `GET /api/tx/transfer/{chain}/status/{signature}`.
 * `confirmations` and `blockNumber` are best-effort metadata.
 */
export interface TransferStatusResponse {
  status: TransferStatus;
  error?: string;
  confirmations?: number;
  blockNumber?: number;
}

/** A confirmed-on-chain or chain-rejected status is terminal. */
export function isTerminalTransferStatus(s: TransferStatus): boolean {
  return s === "success" || s === "failed";
}

/**
 * Look up the chain-level confirmation status of a previously-broadcast
 * native transfer.
 *
 * Behaviour notes:
 *   - On a 4xx/5xx response, throws `TransferApiError` so callers can
 *     decide whether the failure is recoverable (e.g. transient RPC 502).
 *   - A `200` body with `status === "not_found"` is NOT an error — the
 *     broadcast may not have propagated yet. Callers decide when to give
 *     up (e.g. Solana blockhash expires ≈ 90s; EVM mempool ≈ a few min).
 */
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

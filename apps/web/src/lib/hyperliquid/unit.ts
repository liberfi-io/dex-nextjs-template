/**
 * Hyperunit (Unit Protocol) HTTP wrappers.
 *
 * Unit is the official native-asset bridge between Solana / Bitcoin /
 * Ethereum and Hyperliquid.  We only need two endpoints for the SOL → USOL
 * deposit flow:
 *
 *   GET /gen/solana/hyperliquid/sol/{hlEvmAddress}
 *     → returns a per-user Solana deposit address derived from the
 *       Hyperliquid 0x address.  Signatures from each guardian are also
 *       returned for client-side verification (we trust them for now).
 *
 *   GET /operations/{hlEvmAddress}
 *     → returns recent bridge operations (deposits + withdrawals) for the
 *       given Hyperliquid user.  We use this to detect when a SOL deposit
 *       has been credited as USOL on the spot account.
 */

const UNIT_API_BASE = "https://api.hyperunit.xyz";

export type GenAddressResponse = {
  address: string;
  signatures: Record<string, string>;
  status?: string;
};

/**
 * One bridge operation as returned by Hyperunit.  `state` follows the
 * lifecycle described in https://docs.hyperunit.xyz/developers/api/operations/deposit-lifecycle
 * The interesting terminal state for SOL deposits is `"done"`.
 */
export type UnitOperation = {
  operationId: string;
  opCreatedAt: string;
  protocolAddress: string;
  sourceAddress: string;
  destinationAddress: string;
  sourceChain: string;
  destinationChain: string;
  sourceAmount: string;
  destinationFeeAmount: string;
  sweepFeeAmount: string;
  state: string;
  sourceTxHash: string;
  destinationTxHash: string;
  positionInWithdrawQueue: number;
  asset: string;
};

export type OperationsResponse = {
  operations: UnitOperation[];
};

export async function genSolanaDepositAddress(
  hlEvmAddress: string,
  signal?: AbortSignal,
): Promise<GenAddressResponse> {
  const url = `${UNIT_API_BASE}/gen/solana/hyperliquid/sol/${hlEvmAddress}`;
  const res = await fetch(url, { method: "GET", signal });
  if (!res.ok) {
    throw new Error(
      `Hyperunit gen address failed: HTTP ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as GenAddressResponse;
}

export async function getOperations(
  hlEvmAddress: string,
  signal?: AbortSignal,
): Promise<OperationsResponse> {
  const url = `${UNIT_API_BASE}/operations/${hlEvmAddress}`;
  const res = await fetch(url, { method: "GET", signal });
  if (!res.ok) {
    throw new Error(
      `Hyperunit operations failed: HTTP ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as OperationsResponse;
}

/**
 * Find the most recent SOL → Hyperliquid deposit operation that originated
 * from the given Solana source address (the user's connected Solana wallet).
 * Useful for confirming a freshly-broadcast deposit before prompting the
 * user to sign the swap.
 */
export function findLatestSolDeposit(
  ops: UnitOperation[],
  sourceAddress?: string,
): UnitOperation | undefined {
  return ops
    .filter(
      (op) =>
        op.sourceChain === "solana" &&
        op.destinationChain === "hyperliquid" &&
        op.asset.toLowerCase() === "sol" &&
        (!sourceAddress || op.sourceAddress === sourceAddress),
    )
    .sort((a, b) => (a.opCreatedAt < b.opCreatedAt ? 1 : -1))[0];
}

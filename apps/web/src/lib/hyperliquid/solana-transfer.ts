/**
 * Build a native SOL transfer transaction using @solana/web3.js.
 *
 * The wallet adapter's `sendTransaction` expects a serialized (unsigned)
 * transaction as bytes.  The adapter signs and broadcasts it via the
 * embedded Privy / connected wallet.
 */
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const LAMPORTS_PER_SOL = 1_000_000_000;

const DEFAULT_SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

export function getSolanaConnection(rpcUrl?: string): Connection {
  return new Connection(rpcUrl ?? DEFAULT_SOLANA_RPC, "confirmed");
}

export function solToLamports(sol: number | string): bigint {
  const n = typeof sol === "string" ? Number(sol) : sol;
  if (!Number.isFinite(n) || n <= 0) return 0n;
  return BigInt(Math.round(n * LAMPORTS_PER_SOL));
}

export function lamportsToSol(lamports: bigint | number | string): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

/**
 * Build a serialized SystemProgram.transfer transaction with a fresh
 * blockhash.  Returned bytes are the unsigned tx ready to hand to
 * `solanaAdapter.sendTransaction(...)`.
 */
export async function buildSolTransferTx(args: {
  fromAddress: string;
  toAddress: string;
  lamports: bigint;
  rpcUrl?: string;
}): Promise<Uint8Array> {
  const { fromAddress, toAddress, lamports, rpcUrl } = args;
  if (lamports <= 0n) {
    throw new Error("Transfer amount must be > 0");
  }
  const connection = getSolanaConnection(rpcUrl);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = new PublicKey(toAddress);
  const tx = new Transaction({
    feePayer: fromPubkey,
    recentBlockhash: blockhash,
  });
  tx.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: Number(lamports),
    }),
  );
  return tx.serialize({ requireAllSignatures: false, verifySignatures: false });
}

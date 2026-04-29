import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { createPublicClient, http, parseAbi } from "viem";
import { mainnet, bsc } from "viem/chains";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BalanceEntry {
  address: string;
  balance: string;
  decimals: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEM_CHAINS = { eth: mainnet, bnb: bsc } as const;
const SOL_NATIVE_ADDRESS = "11111111111111111111111111111111";
const EVM_NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";
const SOL_DECIMALS = 9;
const EVM_NATIVE_DECIMALS = 18;

const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

const RPC_URLS: Record<string, string | undefined> = {
  sol: process.env.SOLANA_RPC_URL,
  eth: process.env.ETH_RPC_URL,
  bnb: process.env.BSC_RPC_URL,
};

// ---------------------------------------------------------------------------
// RPC clients (lazy singletons)
// ---------------------------------------------------------------------------

let solConnection: Connection | undefined;

function getSolConnection(): Connection {
  if (solConnection) return solConnection;
  const url = RPC_URLS.sol;
  if (!url) throw new Error("SOLANA_RPC_URL not configured");
  solConnection = new Connection(url, "confirmed");
  return solConnection;
}

function getEvmClient(chain: "eth" | "bnb") {
  const url = RPC_URLS[chain];
  if (!url) throw new Error(`${chain.toUpperCase()}_RPC_URL not configured`);
  return createPublicClient({
    chain: VIEM_CHAINS[chain],
    transport: http(url),
  });
}

// ---------------------------------------------------------------------------
// Solana: native SOL + SPL tokens
// ---------------------------------------------------------------------------

async function getSolBalances(
  address: string,
  tokens?: string[],
): Promise<BalanceEntry[]> {
  const conn = getSolConnection();
  const pubkey = new PublicKey(address);
  const results: BalanceEntry[] = [];
  const tokenSet = tokens ? new Set(tokens) : null;

  // Native SOL
  if (!tokenSet || tokenSet.has(SOL_NATIVE_ADDRESS)) {
    const lamports = await conn.getBalance(pubkey);
    results.push({
      address: SOL_NATIVE_ADDRESS,
      balance: lamports.toString(),
      decimals: SOL_DECIMALS,
    });
  }

  // SPL tokens (Token Program + Token 2022)
  const [tokenAccounts, token2022Accounts] = await Promise.all([
    conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    }),
    conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  ]);

  const allAccounts = [
    ...tokenAccounts.value,
    ...token2022Accounts.value,
  ];

  for (const { account } of allAccounts) {
    const info = account.data.parsed?.info;
    if (!info) continue;

    const mint: string = info.mint;
    const tokenAmount = info.tokenAmount;

    if (tokenSet && !tokenSet.has(mint)) continue;
    if (!tokenSet && tokenAmount.amount === "0") continue;

    results.push({
      address: mint,
      balance: tokenAmount.amount,
      decimals: tokenAmount.decimals,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// EVM: native ETH/BNB + ERC-20 tokens
// ---------------------------------------------------------------------------

async function getEvmBalances(
  chain: "eth" | "bnb",
  address: string,
  tokens?: string[],
): Promise<BalanceEntry[]> {
  const client = getEvmClient(chain);
  const results: BalanceEntry[] = [];
  const addr = address as `0x${string}`;

  const tokenSet = tokens ? new Set(tokens.map((t) => t.toLowerCase())) : null;

  // Native balance
  if (!tokenSet || tokenSet.has(EVM_NATIVE_ADDRESS)) {
    const balance = await client.getBalance({ address: addr });
    results.push({
      address: EVM_NATIVE_ADDRESS,
      balance: balance.toString(),
      decimals: EVM_NATIVE_DECIMALS,
    });
  }

  // ERC-20 tokens (only when explicitly requested — standard RPC cannot
  // discover all ERC-20 holdings without an indexer)
  const erc20Addrs =
    tokens?.filter((t) => t.toLowerCase() !== EVM_NATIVE_ADDRESS) ?? [];

  const erc20Results = await Promise.allSettled(
    erc20Addrs.map(async (tokenAddr) => {
      const contractAddr = tokenAddr as `0x${string}`;
      const [balance, decimals] = await Promise.all([
        client.readContract({
          address: contractAddr,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [addr],
        }),
        client.readContract({
          address: contractAddr,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
      ]);
      return {
        address: tokenAddr,
        balance: balance.toString(),
        decimals: Number(decimals),
      } satisfies BalanceEntry;
    }),
  );

  for (const result of erc20Results) {
    if (result.status === "fulfilled") {
      results.push(result.value);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

const SUPPORTED_CHAINS = new Set(["sol", "eth", "bnb"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const chain = searchParams.get("chain");
  const address = searchParams.get("address");
  const tokensParam = searchParams.get("tokens");

  if (!chain || !address) {
    return NextResponse.json(
      { error: "Missing chain or address parameter" },
      { status: 400 },
    );
  }

  if (!SUPPORTED_CHAINS.has(chain)) {
    return NextResponse.json(
      { error: `Unsupported chain: ${chain}. Use sol, eth, or bnb` },
      { status: 400 },
    );
  }

  const tokens = tokensParam
    ? tokensParam.split(",").filter(Boolean)
    : undefined;

  try {
    const balances =
      chain === "sol"
        ? await getSolBalances(address, tokens)
        : await getEvmBalances(chain as "eth" | "bnb", address, tokens);

    return NextResponse.json({ balances });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "RPC query failed" },
      { status: 500 },
    );
  }
}

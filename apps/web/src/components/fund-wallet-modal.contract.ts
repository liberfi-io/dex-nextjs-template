export const FUND_WALLET_MODAL_ID = "fund-prediction-wallet";

export type FundWalletParams = {
  initialScreen?: "main" | "deposit" | "withdraw";
  initialWallet?: "solana" | "evm";
  lockWallet?: boolean;
};

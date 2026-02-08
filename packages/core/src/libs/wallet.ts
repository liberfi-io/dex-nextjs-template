import { CHAIN_ID } from "./chain";

export interface IWallet {
  chain: CHAIN_ID;
  address: string;
  signTransaction: (message: Uint8Array) => Promise<Uint8Array>;
}

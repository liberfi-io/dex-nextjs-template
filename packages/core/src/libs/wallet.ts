import { Chain } from "@liberfi.io/types";

export interface IWallet {
  chain: Chain;
  address: string;
  signTransaction: (message: Uint8Array) => Promise<Uint8Array>;
}

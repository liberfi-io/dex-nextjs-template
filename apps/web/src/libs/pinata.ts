import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

import { truncateAddress } from "@liberfi.io/utils";

/** Keep short strings intact; otherwise show start...end. */
export function formatShortAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return truncateAddress(address, startLength, endLength);
}

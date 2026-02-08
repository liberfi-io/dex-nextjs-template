export const QueryKeys = {
  currentUser: () => ["currentUser"],
  dexToken: () => ["dexToken"],
  tokenAddressesInCollection: (type: string) => ["tokenAddressesInCollection", type],
};

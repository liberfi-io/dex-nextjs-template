import { CHAIN_ID } from "@liberfi/core";
import { ActivityList } from "../account";

export function AccountActivityList() {
  return (
    <div className="flex-1 w-full pb-2.5 flex flex-col">
      <ActivityList
        chainId={CHAIN_ID.SOLANA}
        compact
        classNames={{ itemWrapper: "px-2", item: "px-2 hover:bg-content2" }}
      />
    </div>
  );
}

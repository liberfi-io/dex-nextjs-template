import type { PropsWithChildren } from "react";
import { TokenList, type TokenListActionsComponent } from "@liberfi.io/ui-tokens";

const InitialTokenListActions: TokenListActionsComponent = () => null;

export function DiscoverTokenListSkeleton() {
  return (
    <div
      data-testid="discover-token-list-skeleton"
      aria-hidden="true"
      className="h-full min-h-0 w-full overflow-hidden"
    >
      <TokenList tokens={[]} isLoading ActionsComponent={InitialTokenListActions} />
    </div>
  );
}

export function DiscoverTokenListMeasurementGate({
  height,
  children,
}: PropsWithChildren<{ height?: number }>) {
  return (height ?? 0) > 0 ? children : <DiscoverTokenListSkeleton />;
}

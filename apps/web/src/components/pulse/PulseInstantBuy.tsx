import { memo, useCallback } from "react";
import { LightningIcon, StyledButton } from "@liberfi.io/ui";
import { Token } from "@liberfi.io/types";
import { formatPrice } from "@liberfi.io/utils";
import { usePulseInstantBuy } from "./PulseInstantBuyContext";

export const PulseInstantBuy = memo(function PulseInstantBuy({
  token,
}: {
  token: Token;
}) {
  const { amount, primaryTokenSymbol, buy } = usePulseInstantBuy();

  const handlePress = useCallback(
    () => buy(token.address),
    [buy, token.address],
  );

  return (
    <StyledButton
      color="primary"
      radius="full"
      size="sm"
      startContent={
        <LightningIcon width={12} height={12} className="flex-none" />
      }
      endContent={<span>{primaryTokenSymbol}</span>}
      onPress={handlePress}
      disableRipple
      className="absolute right-0 -bottom-3 w-auto min-w-0 h-auto min-h-0 px-2 py-1 gap-0.5 text-xs font-bold"
    >
      {formatPrice(amount ?? 0)}
    </StyledButton>
  );
});

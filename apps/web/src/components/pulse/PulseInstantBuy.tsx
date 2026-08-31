import { memo, useCallback, useState } from "react";
import { cn, LightningIcon, Button, Spinner } from "@liberfi.io/ui";
import { Token } from "@liberfi.io/types";
import { usePulseInstantBuy } from "./PulseInstantBuyContext";
import { formatInstantTradeButtonAmount } from "../home/InstantTradeListButton";

export const PulseInstantBuy = memo(function PulseInstantBuy({
  token,
  onStart,
  onSettled,
}: {
  token: Token;
  onStart?: () => void;
  onSettled?: () => void;
}) {
  const { amount, primaryTokenSymbol, buy } = usePulseInstantBuy();
  const [isBuying, setIsBuying] = useState(false);

  const handlePress = useCallback(async () => {
    if (isBuying) return;

    setIsBuying(true);
    onStart?.();
    try {
      await buy(token.address);
    } finally {
      setIsBuying(false);
      onSettled?.();
    }
  }, [buy, isBuying, onSettled, onStart, token.address]);

  const formattedAmount = formatInstantTradeButtonAmount(amount);
  const label =
    formattedAmount == null || !primaryTokenSymbol
      ? undefined
      : `${formattedAmount} ${primaryTokenSymbol}`;

  return (
    <Button
      variant="solid"
      color="primary"
      radius="full"
      size="sm"
      startContent={
        <LightningIcon className="flex-none" style={{ color: "var(--color-brand-primary)" }} />
      }
      onPress={handlePress}
      isLoading={isBuying}
      spinner={<Spinner size="sm" color="current" />}
      disableRipple
      className={cn("absolute right-0 -bottom-3 min-w-0 w-auto flex-none")}
      style={{
        background:
          "linear-gradient(hsl(var(--heroui-primary) / 0.08), hsl(var(--heroui-primary) / 0.08)), #0a0a0b",
        border: "1px solid hsl(var(--heroui-primary) / 0.2)",
        color: "var(--color-brand-primary)",
        fontWeight: 600,
      }}
    >
      {label}
    </Button>
  );
});

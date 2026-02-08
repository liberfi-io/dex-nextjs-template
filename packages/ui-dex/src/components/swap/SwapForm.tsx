import { useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import { FromInput } from "./FromInput";
import { useSwapContext } from "./SwapContext";
import { ToInput } from "./ToInput";

export type SwapFormProps = {
  onSubmit: () => void;
};

export function SwapForm({ onSubmit }: SwapFormProps) {
  const { t } = useTranslation();

  const { routeInfo, isRouting } = useSwapContext();

  return (
    <div className="px-4 pb-4 lg:pb-8">
      <FromInput />

      <ToInput />

      <Button
        fullWidth
        color="primary"
        className="flex mt-8 rounded-lg"
        disableRipple
        isDisabled={!routeInfo}
        isLoading={!routeInfo && isRouting}
        onPress={onSubmit}
      >
        {t("extend.account.convert")}
      </Button>
    </div>
  );
}

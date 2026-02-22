import { clsx } from "clsx";
import { SwitchWallet } from "../wallet";
import { useTranslation } from "@liberfi/ui-base";
import { PulseHeaderInstantBuyAmount } from "./PulseHeaderInstantBuyAmount";

export type PulseHeaderProps = {
  className?: string;
};

export function PulseHeader({ className }: PulseHeaderProps) {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "flex-none w-full h-8 px-3 flex items-center justify-between max-lg:justify-start gap-4",
        className,
      )}
    >
      <div className="max-lg:hidden">
        <h1 className="text-lg font-semibold">{t("extend.pulse.title")}</h1>
      </div>
      <div className="flex items-center gap-4 max-lg:w-full max-lg:justify-between">
        <SwitchWallet />
        <PulseHeaderInstantBuyAmount />
      </div>
    </div>
  );
}

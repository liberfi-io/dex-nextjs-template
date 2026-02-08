import { useTranslation } from "@liberfi/ui-base";

export function BottomNetworkStatus() {
  const { t } = useTranslation();
  return (
    <div className="flex h-6 px-2 gap-1 items-center rounded-small text-success bg-success/20">
      <div className="flex gap-1 items-center">
        <div className="bg-success/60 w-3 h-3 rounded-full flex justify-center items-center">
          <div className="bg-success w-2 h-2 rounded-full" />
        </div>
      </div>
      <span className="text-xs font-medium text-success">{t("extend.network.stable")}</span>
    </div>
  );
}

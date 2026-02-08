import { useTranslation } from "@liberfi/ui-base";
import { Skeleton } from "@heroui/react";

// TODO @deprecated
export function SwapSkeletons() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 px-4 pb-4 lg:pb-8">
      <div className="space-y-3">
        <p className="text-neutral font-medium text-sm">{t("extend.account.convert_from")}</p>
        <div className="flex flex-col gap-3 rounded-lg px-3.5 pb-1 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div className="flex items-center justify-between"></div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-neutral font-medium text-sm">{t("extend.account.convert_to")}</p>
        <div className="flex flex-col gap-3 rounded-lg px-3.5 pb-1 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div className="flex items-center justify-between"></div>
        </div>
      </div>
    </div>
  );
}

import { ArrowRightIcon } from "../../assets/icons";
import { AppRoute } from "../../libs";
import { Link, Skeleton } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import { useAuthenticatedCallback, useRouter, useTranslation } from "@liberfi/ui-base";
import { AddCashAction, ConvertAction, ReceiveAction, SendAction } from "./actions";

export function AccountOverviewSkeleton() {
  const { t } = useTranslation();

  const { navigate } = useRouter();

  const handleAccountLink = useAuthenticatedCallback(() => {
    navigate(AppRoute.account);
  }, [navigate]);

  return (
    <div className="w-full lg:h-full p-0 lg:py-3 lg:px-5 flex flex-col lg:justify-between">
      <div className="w-full flex justify-between gap-2">
        <section className="flex-none flex flex-col justify-between">
          <Link
            className="flex items-center text-xs font-medium text-neutral cursor-pointer"
            onPress={handleAccountLink}
          >
            {t("extend.account.universal_account", { application_name: CONFIG.branding.name })}
            <ArrowRightIcon width={14} height={14} />
          </Link>

          <div className="w-16 h-8 py-2">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>

          <div className="w-32 h-5 py-1">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </section>

        <div className="flex-1 h-[72px]">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
      <div className="w-full flex justify-center max-lg:mt-3 text-neutral">
        <AddCashAction />
        <ReceiveAction />
        <SendAction />
        <ConvertAction />
      </div>
    </div>
  );
}

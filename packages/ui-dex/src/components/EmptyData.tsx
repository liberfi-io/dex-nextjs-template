import { NoDataIcon } from "../assets";
import { useTranslation } from "@liberfi/ui-base";
import clsx from "clsx";

export type EmptyDataProps = {
  className?: string;
  message?: string;
};

export function EmptyData({ className, message }: EmptyDataProps) {
  const { t } = useTranslation();
  return (
    <div
      className={clsx("flex w-full flex-col items-center justify-center gap-1.5 py-3", className)}
    >
      <NoDataIcon width={35} height={35} />
      <span className="text-xs text-neutral">{message || t("extend.common.no_data")}</span>
    </div>
  );
}

import { ListHeader } from "../../ListHeader";
import { AgeFilter } from "../filters";
import { AgeSort } from "../sorts";
import { useTranslation } from "@liberfi/ui-base";

export type AgeHeaderProps = {
  className?: string;
  hideFilter?: boolean;
};

export function AgeHeader({ className, hideFilter }: AgeHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader width={54} className={className}>
      <div className="flex items-center justify-start gap-1">
        <AgeSort>{t("extend.token_list.attributes.age")}</AgeSort>
        {!hideFilter && <AgeFilter />}
      </div>
    </ListHeader>
  );
}

import { useCallback } from "react";
import copyToClipboard from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { useTranslation } from "@liberfi/ui-base";

export function useCopyToClipboard() {
  const { t } = useTranslation();

  return useCallback(
    (text: string) => {
      if (copyToClipboard(text)) {
        toast.success(t("extend.common.copied"), { duration: 2000 });
      }
    },
    [t],
  );
}

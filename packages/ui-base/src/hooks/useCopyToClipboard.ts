import { useCallback } from "react";
import copyToClipboard from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { useTranslation } from "./useTranslation";

export function useCopyToClipboard() {
  const { t } = useTranslation();

  return useCallback(
    (text: string, toastMessage?: string) => {
      if (copyToClipboard(text)) {
        toast.success(toastMessage ?? t("extend.common.copied"), { duration: 2000 });
      }
    },
    [t],
  );
}

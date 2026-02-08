import { useCallback } from "react";
import { useTvChartManager } from "./TvChartProvider";
import { useTranslation } from "@liberfi/ui-base";
import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { CameraIcon, CopyIcon, DownloadIcon } from "@/assets";
import clsx from "clsx";
import { toast } from "react-hot-toast";

export function TvChartSnapshot({ className }: { className?: string }) {
  const { t } = useTranslation();

  const chartManager = useTvChartManager();

  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const handleDownloadSnapshot = useCallback(async () => {
    onClose();

    const snapshot = await chartManager.internalWidget?.takeClientScreenshot();
    if (snapshot) {
      const a = document.createElement("a");
      a.download = "screenshot";
      a.href = snapshot.toDataURL();
      a.dataset.downloadurl = ["image/png", a.download, a.href].join(":");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.error("TvChartSnapshot: failed to take snapshot");
    }
  }, [chartManager, onClose]);

  const handleCopySnapshot = useCallback(async () => {
    onClose();

    const snapshot = await chartManager.internalWidget?.takeClientScreenshot();
    if (snapshot) {
      snapshot.toBlob(async (blob) => {
        if (blob && typeof navigator !== "undefined") {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            toast.success(t("extend.common.copied"));
            console.debug("TvChartSnapshot: screenshot copied to clipboard successfully!");
          } catch (error) {
            console.error("TvChartSnapshot: failed to take snapshot", error);
          }
        }
      });
    } else {
      console.error("TvChartSnapshot: failed to take snapshot");
    }
  }, [chartManager, t, onClose]);

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-end"
      classNames={{
        trigger: className,
        content: "w-64 bg-content2 rounded-lg p-4",
      }}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          className="w-auto min-w-0 h-6 min-h-0 px-0 bg-transparent text-neutral"
          disableRipple
        >
          <CameraIcon width={24} height={24} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-full gap-y-2 flex items-center flex-wrap text-xs text-neutral">
          <div
            className={clsx(
              "w-full h-10 px-2.5 flex items-center gap-2 rounded-lg hover:opacity-hover cursor-pointer",
              "text-xs text-neutral bg-transparent border border-content3",
            )}
            onClick={() => handleDownloadSnapshot()}
          >
            <DownloadIcon width={16} height={16} />
            <span>{t("extend.trade.tvchart.snapshot.download")}</span>
          </div>
          <div
            className={clsx(
              "w-full h-10 px-2.5 flex items-center gap-2 rounded-lg hover:opacity-hover cursor-pointer",
              "text-xs text-neutral bg-transparent border border-content3",
            )}
            onClick={() => handleCopySnapshot()}
          >
            <CopyIcon width={16} height={16} />
            <span>{t("extend.trade.tvchart.snapshot.copy")}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

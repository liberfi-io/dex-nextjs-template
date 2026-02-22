import { useCallback } from "react";
import { clsx } from "clsx";
import { Button, Tooltip } from "@heroui/react";
import { useCopyToClipboard, useTranslation } from "@liberfi/ui-base";
import { formatShortAddress } from "../../libs";
import { TokenAvatar } from "../token";
import { Token } from "@chainstream-io/sdk";
import { RecursivePartial } from "@liberfi/core";

export type PulseAvatarProps = {
  // New ranking token should be displayed as soon as possible, so it may not be complete
  token: RecursivePartial<Token>;
};

export function PulseAvatar({ token }: PulseAvatarProps) {
  const { t } = useTranslation();

  const copy = useCopyToClipboard();

  const handleCopyAddress = useCallback(() => {
    if (token.address) {
      copy(token.address, t("extend.pulse.copied_address"));
    }
  }, [token.address, copy, t]);

  return (
    <div className="flex flex-col items-center gap-1">
      <TokenAvatar
        token={token}
        enableSearch
        enablePreview={!!token.imageUrl}
        showProgress
        classNames={{
          avatar: "w-17 h-17 text-[40px]",
          searchIcon: "w-6 h-6",
        }}
      />
      {/* copy token address */}
      <Tooltip
        placement="right"
        closeDelay={0}
        content={t("extend.pulse.copy_address", { address: token.address ?? "" })}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
      >
        <Button
          className={clsx(
            "text-xs text-neutral hover:text-primary/50 text-center",
            "max-w-18 min-w-0 w-auto min-h-0 h-auto",
            "p-0 bg-transparent overflow-visible",
          )}
          disableRipple
          disableAnimation
          onPress={handleCopyAddress}
        >
          {formatShortAddress(token.address ?? "", 4, 4)}
        </Button>
      </Tooltip>
    </div>
  );
}

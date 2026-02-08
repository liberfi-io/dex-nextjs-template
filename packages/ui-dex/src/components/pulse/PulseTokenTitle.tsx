import { MouseEvent, useCallback } from "react";
import { clsx } from "clsx";
import { Tooltip } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import { CopyIcon, useCopyToClipboard, useTranslation } from "@liberfi/ui-base";
import { RecursivePartial } from "@liberfi/core";

export type PulseTokenTitleProps = {
  // New ranking token should be displayed as soon as possible, so it may not be complete
  token: RecursivePartial<Token>;
};

export function PulseTokenTitle({ token }: PulseTokenTitleProps) {
  const { t } = useTranslation();

  const copy = useCopyToClipboard();

  const handleCopyTokenAddress = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      copy(token.address ?? "", t("extend.pulse.copied_address"));
    },
    [t, token.address, copy],
  );

  return (
    <div className="w-full flex gap-3 items-center pr-20">
      {/* symbol & link to token page */}
      <h3
        className={clsx(
          "flex-none text-base text-foreground font-semibold whitespace-nowrap text-ellipsis overflow-hidden",
          "group-data-[layout=narrow]:text-sm group-data-[layout=narrow]:max-w-15",
        )}
      >
        {token.symbol}
      </h3>

      {/* name & copy address */}
      <div className="flex-1 flex overflow-hidden">
        <Tooltip
          content={token.name}
          classNames={{ content: "text-xs text-neutral py-2 px-4" }}
          closeDelay={0}
        >
          <div
            className={clsx(
              "flex items-center gap-1 text-base text-neutral hover:text-primary/50 whitespace-nowrap overflow-hidden cursor-pointer",
              "group-data-[layout=narrow]:text-sm",
            )}
            onClick={handleCopyTokenAddress}
          >
            <span className="text-ellipsis overflow-hidden group-data-[layout=narrow]:max-w-14">
              {token.name}
            </span>
            <CopyIcon className="flex-none" width={14} height={14} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

import { clsx } from "clsx";
import { Link, Tooltip } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import { chainIdBySlug, formatAmount, RecursivePartial } from "@liberfi/core";
import {
  CrownIcon,
  KlineCandlesIcon,
  PeopleIcon,
  useTranslation,
  VerifiedIcon,
} from "@liberfi/ui-base";
import { accountExplorerUrl } from "../../libs";
import { useMemo } from "react";

export type PulseTokenHoldersProps = {
  token: RecursivePartial<Token>;
  className?: string;
};

export function PulseTokenHolders({ token, className }: PulseTokenHoldersProps) {
  const { t } = useTranslation();

  const chainId = useMemo(() => chainIdBySlug(token.chain ?? ""), [token.chain]);

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {/* holders */}
      <Tooltip
        content={t("extend.pulse.holders")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div className="flex items-center gap-1 text-neutral hover:text-foreground">
          <PeopleIcon width={16} height={16} />
          <span className="text-foreground text-xs">
            {formatAmount(token.marketData?.holders ?? 0)}
          </span>
        </div>
      </Tooltip>

      {/* pro */}
      <Tooltip
        content={t("extend.pulse.pro")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div className="flex items-center gap-1 text-neutral hover:text-foreground">
          <KlineCandlesIcon width={20} height={20} />
          <span className="text-foreground text-xs">
            {token.marketData?.proTotalHolders === undefined
              ? "--"
              : formatAmount(token.marketData?.proTotalHolders)}
          </span>
        </div>
      </Tooltip>

      {/* kol */}
      <Tooltip
        content={t("extend.pulse.kol")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div className="flex items-center gap-1 text-neutral hover:text-foreground">
          <VerifiedIcon width={16} height={16} />
          <span className="text-foreground text-xs">
            {token.marketData?.kolTotalHolders === undefined
              ? "--"
              : formatAmount(token.marketData?.kolTotalHolders)}
          </span>
        </div>
      </Tooltip>

      {/* dev tokens */}
      {chainId && (
        <Tooltip
          content={
            <div className="flex flex-col gap-1">
              <p>{t("extend.pulse.dev")}</p>
              <p className="text-xxs">{t("extend.pulse.dev_explorer")}</p>
            </div>
          }
          classNames={{ content: "text-xs text-neutral py-2 px-4" }}
          closeDelay={0}
        >
          <Link
            className="flex items-center gap-1 text-neutral hover:text-foreground"
            // TODO
            href={accountExplorerUrl(chainId ?? "", token.address ?? "")}
            target="_blank"
          >
            <CrownIcon width={16} height={16} />
            <span className="text-foreground text-xs">
              {token.devTotalTokens === undefined ? "--" : formatAmount(token.devTotalTokens)}
            </span>
          </Link>
        </Tooltip>
      )}
    </div>
  );
}

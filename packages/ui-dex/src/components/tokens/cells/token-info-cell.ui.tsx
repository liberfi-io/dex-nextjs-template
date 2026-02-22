import { Token } from "@chainstream-io/sdk";
import {
  CookIcon,
  PeopleIcon,
  UserIcon,
  UserWithStarBadgeIcon,
  useTranslation,
} from "@liberfi/ui-base";
import { useMemo } from "react";
import { StyledTooltip } from "../../StyledTooltip";
import { Chip } from "@heroui/react";
import { formatAmount } from "@liberfi/core";
import { formatPercentage } from "../../../libs";

export function TokenInfoCell({ token }: { token: Token }) {
  const { t } = useTranslation();

  const holders = useMemo(() => token.marketData?.holders, [token.marketData?.holders]);

  const devHoldingsRatio = useMemo(
    () => token.marketData?.devHoldingsRatio,
    [token.marketData?.devHoldingsRatio],
  );

  const top10HoldingsRatio = useMemo(
    () => token.marketData?.top10HoldingsRatio,
    [token.marketData?.top10HoldingsRatio],
  );

  const top100HoldingsRatio = useMemo(
    () => token.marketData?.top100HoldingsRatio,
    [token.marketData?.top100HoldingsRatio],
  );

  return (
    <div className="flex gap-1.5 justify-start items-start">
      {/* column 1 */}
      <div className="flex flex-col gap-1 items-start justify-start">
        {/* Holders */}
        <StyledTooltip content={t("tokens.tokenInfo.holders")} closeDelay={0}>
          <Chip
            className="pl-2 pr-1.5 gap-0.5 h-5"
            startContent={<PeopleIcon width={14} height={14} />}
            variant="flat"
            size="sm"
          >
            {holders ? formatAmount(holders) : "--"}
          </Chip>
        </StyledTooltip>

        {/* Dev holdings */}
        <StyledTooltip content={t("tokens.tokenInfo.devHoldingsRatio")} closeDelay={0}>
          <Chip
            className="pl-2 pr-1.5 gap-0.5 h-5"
            startContent={<CookIcon width={13} height={13} />}
            variant="flat"
            size="sm"
          >
            {devHoldingsRatio ? formatPercentage(devHoldingsRatio) : "--"}
          </Chip>
        </StyledTooltip>
      </div>
      {/* column 2 */}
      <div className="flex flex-col gap-1 items-start justify-start">
        {/* Top 10 holdings */}
        <StyledTooltip content={t("tokens.tokenInfo.top10HoldingsRatio")} closeDelay={0}>
          <Chip
            className="pl-2 pr-1.5 gap-0.5 h-5"
            startContent={<UserWithStarBadgeIcon width={14} height={14} />}
            variant="flat"
            size="sm"
          >
            {top10HoldingsRatio ? formatPercentage(top10HoldingsRatio) : "--"}
          </Chip>
        </StyledTooltip>
        {/* Top 100 holdings */}
        <StyledTooltip content={t("tokens.tokenInfo.top100HoldingsRatio")} closeDelay={0}>
          <Chip
            className="pl-2 pr-1.5 gap-0.5 h-5"
            startContent={<UserIcon width={14} height={14} />}
            variant="flat"
            size="sm"
          >
            {top100HoldingsRatio ? formatPercentage(top100HoldingsRatio) : "--"}
          </Chip>
        </StyledTooltip>
      </div>
    </div>
  );
}

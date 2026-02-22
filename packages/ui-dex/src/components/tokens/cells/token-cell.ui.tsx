import { StyledTooltip } from "../../StyledTooltip";
import { TokenAvatar2 } from "../../token/TokenAvatar2";
import { formatAge, searchTwitterUrl } from "../../../libs";
import { Token } from "@chainstream-io/sdk";
import { Link } from "@heroui/react";
import {
  CopyIcon,
  DiscordIcon,
  SearchIcon,
  TelegramIcon,
  tickAtom,
  TwitterIcon,
  useCopyToClipboard,
  useTranslation,
  WebsiteIcon,
} from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { MouseEvent, useCallback, useMemo } from "react";

export function TokenCell({ token }: { token: Token }) {
  const copyToClipboard = useCopyToClipboard();

  const { t } = useTranslation();

  const handleCopyToClipboard = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      copyToClipboard(token.address, t("tokens.copied.address"));
    },
    [copyToClipboard, token.address, t],
  );

  const now = useAtomValue(tickAtom);

  const age = useMemo(
    () => (token.tokenCreatedAt ? formatAge(token.tokenCreatedAt, now) : undefined),
    [token, now],
  );

  return (
    <div className="w-full flex items-center gap-2">
      {/* avatar */}
      <TokenAvatar2 token={token} className="w-9 h-9 sm:w-14 sm:h-14 flex-none" />

      {/* symbol & name & social media ...etc */}
      <div className="flex-auto flex flex-col gap-1 min-w-0">
        {/* symbol & name */}
        <div className="flex items-center gap-1">
          <span className="flex-none">{token.symbol}</span>
          <StyledTooltip content={token.name} closeDelay={0}>
            <div
              className="flex-initial flex items-center gap-1 min-w-0 text-neutral hover:text-primary/40 cursor-pointer"
              onClick={handleCopyToClipboard}
            >
              <div className="flex-initial whitespace-nowrap truncate">{token.name}</div>
              <CopyIcon className="flex-none" width={16} height={16} />
            </div>
          </StyledTooltip>
        </div>

        {/* social medias */}
        <div className="flex items-center gap-2">
          {/* age */}
          <span className="text-primary">{age ?? "--"}</span>
          {/* website */}
          {token.socialMedias?.website && (
            <Link
              href={token.socialMedias.website}
              className="text-neutral hover:text-primary"
              target="_blank"
            >
              <WebsiteIcon width={16} height={16} />
            </Link>
          )}
          {/* twitter */}
          {token.socialMedias?.twitter && (
            <Link
              href={token.socialMedias.twitter}
              className="text-neutral hover:text-primary"
              target="_blank"
            >
              <TwitterIcon width={16} height={16} />
            </Link>
          )}
          {/* telegram */}
          {token.socialMedias?.telegram && (
            <Link
              href={token.socialMedias.telegram}
              className="text-neutral hover:text-primary"
              target="_blank"
            >
              <TelegramIcon width={16} height={16} />
            </Link>
          )}
          {/* discord */}
          {token.socialMedias?.discord && (
            <Link
              href={token.socialMedias.discord}
              className="text-neutral hover:text-primary"
              target="_blank"
            >
              <DiscordIcon width={16} height={16} />
            </Link>
          )}
          {/* search on twitter */}
          <Link
            href={searchTwitterUrl(`${token.symbol} OR ${token.address}`)}
            className="text-neutral hover:text-primary"
            target="_blank"
          >
            <SearchIcon width={16} height={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

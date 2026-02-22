import { MouseEvent, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { Avatar, Image } from "@heroui/react";
import { Chain, getTokenProtocol, SafeBigNumber } from "@liberfi/core";
import { chainIdBySlug } from "@liberfi.io/utils";
import { Token } from "@chainstream-io/sdk";
import { searchImageUrl } from "../../libs";
import clsx from "clsx";
import { CameraIcon } from "@liberfi/ui-base";
import { StyledTooltip } from "../StyledTooltip";

export type TokenAvatar2Props = {
  /** token data to display */
  token: Token;
  /** whether hover to preview the avatar */
  enablePreview?: boolean;
  /** whether click to search the avatar */
  enableSearch?: boolean;
  /** whether show the bonding curve progress */
  showProgress?: boolean;
  /** whether show the launch protocol family icon */
  showProtocolFamily?: boolean;
  /** radius of the avatar */
  radius?: "none" | "sm" | "md" | "lg";
  /** use this class to adjust the size of the avatar */
  className?: string;
  /** customize the styles */
  classNames?: {
    /** use this class to adjust the color of the avatar background, background is displayed when progress is not displayed */
    background?: string;
    /** use this class to adjust the color of the progress track */
    progress?: string;
    /** use this class to adjust the color of the avatar wrapper */
    avatarWrapper?: string;
    /** use this class to adjust the size of the avatar */
    avatar?: string;
    /** use this class to adjust the size of the protocol family icon's wrapper */
    protocolFamilyIconWrapper?: string;
    /** use this class to adjust the size of the protocol family icon */
    protocolFamilyIcon?: string;
    /** use this class to adjust the size & background color of the search wrapper */
    searchWrapper?: string;
    /** use this class to adjust the size & color of the search icon */
    searchIcon?: string;
    /** use this class to adjust the size of the preview wrapper */
    previewWrapper?: string;
    /** use this class to adjust the size of the avatar in the preview */
    previewAvatar?: string;
    /** use this class to adjust the size & background color of the search wrapper in the preview */
    previewSearchWrapper?: string;
    /** use this class to adjust the size & color of the search icon in the preview */
    previewSearchIcon?: string;
  };
};

export function TokenAvatar2({
  token,
  enablePreview = true,
  enableSearch = true,
  showProgress = true,
  showProtocolFamily = true,
  radius = "sm",
  className,
  classNames,
}: TokenAvatar2Props) {
  const formattedProtocolFamily = useMemo(
    () =>
      token.extra?.launchFromProtocolFamily
        ? getTokenProtocol(
            chainIdBySlug(token.chain) ?? Chain.SOLANA,
            token.extra?.launchFromProtocolFamily,
          )
        : undefined,
    [token.chain, token.extra?.launchFromProtocolFamily],
  );

  const displayProtocolFamily = useMemo(
    () => showProtocolFamily && formattedProtocolFamily,
    [showProtocolFamily, formattedProtocolFamily],
  );

  const displayProgress = useMemo(
    () =>
      showProgress &&
      token.marketData.completionRatio &&
      new SafeBigNumber(token.marketData.completionRatio).lt(100),
    [showProgress, token.marketData.completionRatio],
  );

  const displaySearch = useMemo(
    () => enableSearch && token.imageUrl,
    [enableSearch, token.imageUrl],
  );

  const fallbackName = useMemo(
    () => (token.symbol ?? token.name ?? token.address ?? "L").slice(0, 1).toUpperCase(),
    [token.symbol, token.name, token.address],
  );

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // TODO use router adapter
  const handleSearch = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!token.imageUrl) return;
      const url = searchImageUrl(token.imageUrl);
      window.open(url, "_blank");
    },
    [token.imageUrl],
  );

  return (
    <div className={clsx("relative justify-center items-center w-15 h-15", className)}>
      {/* if progress is not displayed, fill the background with the protocol family color */}
      {!displayProgress && (
        <div
          className={clsx(
            "absolute inset-0",
            `rounded-${radius}`,
            formattedProtocolFamily ? `bg-${formattedProtocolFamily}` : "bg-bullish",
            classNames?.background,
          )}
        />
      )}

      {/* if progress is displayed, display the progress track with the protocol family color */}
      {displayProgress && (
        <div className={clsx("absolute -inset-0.5", `rounded-${radius}`)}>
          <ProgressTrack
            className={clsx(
              formattedProtocolFamily ? `text-${formattedProtocolFamily}` : "text-bullish",
              classNames?.progress,
            )}
            progress={token.marketData.completionRatio ?? "0"}
          />
        </div>
      )}

      {/* avatar fallback border */}
      <div
        className={clsx(
          "absolute inset-0 p-px flex items-center justify-center",
          `rounded-${radius}`,
          formattedProtocolFamily ? `bg-${formattedProtocolFamily}/20` : "bg-bullish/20",
          classNames?.avatarWrapper,
        )}
      >
        {/* preview the avatar */}
        <PreviewWrapper
          token={token}
          radius={radius}
          enableSearch={enableSearch}
          enablePreview={enablePreview}
          classNames={classNames}
        >
          {/* this is the gap between border & avatar, should fill with the gray background color */}
          <div
            className={clsx(
              "relative w-full h-full bg-content1 flex items-center justify-center p-0.5",
              `rounded-${radius}`,
              // click to search
              isHovered && displaySearch && "cursor-pointer",
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* avatar */}
            <Avatar
              showFallback
              src={token.imageUrl}
              name={fallbackName}
              className={clsx(
                "w-full h-full bg-content1 text-neutral text-2xl",
                `rounded-${radius}`,
                classNames?.avatar,
              )}
            />

            {/* hover to search mask */}
            {isHovered && displaySearch && (
              <div
                className={clsx(
                  "absolute inset-0 bg-content1/80 flex items-center justify-center",
                  `rounded-${radius}`,
                  classNames?.searchWrapper,
                )}
                onClick={handleSearch}
              >
                <CameraIcon className={clsx("w-6 h-6", classNames?.searchIcon)} />
              </div>
            )}
          </div>
        </PreviewWrapper>
      </div>

      {/* protocol family icon */}
      {displayProtocolFamily && (
        <div className="contents">
          <StyledTooltip
            content={token.extra?.launchFromProtocolFamily ?? formattedProtocolFamily}
            placement="bottom"
            closeDelay={0}
          >
            <div
              className={clsx(
                "absolute -bottom-1 -right-1 rounded-full p-px w-4 h-4",
                `bg-${formattedProtocolFamily}`,
                classNames?.protocolFamilyIconWrapper,
              )}
            >
              <Image
                removeWrapper
                src={`/images/protocols/${token.chain}/${formattedProtocolFamily}.svg`}
                className={clsx(
                  "w-full h-full rounded-full bg-content1",
                  classNames?.protocolFamilyIcon,
                )}
              />
            </div>
          </StyledTooltip>
        </div>
      )}
    </div>
  );
}

function PreviewWrapper({
  token,
  radius,
  enableSearch,
  enablePreview,
  classNames,
  children,
}: PropsWithChildren<
  Pick<TokenAvatar2Props, "token" | "radius" | "enableSearch" | "enablePreview" | "classNames">
>) {
  const displayPreview = useMemo(
    () => enablePreview && token.imageUrl,
    [enablePreview, token.imageUrl],
  );

  return displayPreview ? (
    <StyledTooltip
      content={
        <Preview
          token={token}
          radius={radius}
          enableSearch={enableSearch}
          classNames={classNames}
        />
      }
      closeDelay={100}
      placement="bottom-start"
      classNames={{ content: "p-1" }}
    >
      {children}
    </StyledTooltip>
  ) : (
    children
  );
}

function Preview({
  token,
  enableSearch,
  radius,
  classNames,
}: Pick<TokenAvatar2Props, "token" | "radius" | "enableSearch" | "classNames">) {
  const displaySearch = useMemo(
    () => enableSearch && token.imageUrl,
    [enableSearch, token.imageUrl],
  );

  const fallbackName = useMemo(
    () => (token.symbol ?? token.name ?? token.address ?? "L").slice(0, 1).toUpperCase(),
    [token.symbol, token.name, token.address],
  );

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // TODO use router adapter
  const handleSearch = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!token.imageUrl) return;
      const url = searchImageUrl(token.imageUrl);
      window.open(url, "_blank");
    },
    [token.imageUrl],
  );

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center w-60 h-60",
        `rounded-${radius}`,
        isHovered && displaySearch && "cursor-pointer",
        classNames?.previewWrapper,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Avatar
        showFallback
        src={token.imageUrl}
        name={fallbackName}
        className={clsx(
          "w-full h-full bg-content1 text-neutral text-3xl",
          `rounded-${radius}`,
          classNames?.previewAvatar,
        )}
      />

      {/* hover to search mask */}
      {isHovered && displaySearch && (
        <div
          className={clsx(
            "absolute inset-0 bg-content1/80 flex items-center justify-center",
            `rounded-${radius}`,
            classNames?.previewSearchWrapper,
          )}
          onClick={handleSearch}
        >
          <CameraIcon className={clsx("w-10 h-10", classNames?.previewSearchIcon)} />
        </div>
      )}
    </div>
  );
}

function ProgressTrack({ progress, className }: { progress: string | number; className?: string }) {
  const strokeDashoffset = useMemo(() => 296 - (Number(progress) * 296) / 100, [progress]);
  return (
    <svg viewBox="0 0 78 78" className="w-full h-full">
      <path
        className={`${className} opacity-40`}
        stroke="currentColor"
        fill="transparent"
        strokeWidth="1"
        d="
    M 76 76
    L 6 76
    Q 2 76 2 72
    L 2 6
    Q 2 2 6 2
    L 72 2
    Q 76 2 76 6
    L 76 72
    Q 76 76 76 76
  "
      ></path>
      <path
        className={`${className} transition-all duration-300 ease-in-out`}
        stroke="currentColor"
        fill="transparent"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="296"
        strokeDashoffset={strokeDashoffset}
        d="
    M 76 76
    L 6 76
    Q 2 76 2 72
    L 2 6
    Q 2 2 6 2
    L 72 2
    Q 76 2 76 6
    L 76 72
    Q 76 76 76 76
  "
      ></path>
    </svg>
  );
}

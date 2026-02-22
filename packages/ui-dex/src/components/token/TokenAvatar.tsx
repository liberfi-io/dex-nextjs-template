import { MouseEvent, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import { BigNumber } from "bignumber.js";
import { Avatar, Tooltip } from "@heroui/react";
import { Token, TokenExtraDTO, TokenMarketData } from "@chainstream-io/sdk";
import { getTokenProtocol } from "@liberfi/core";
import { chainIdBySlug } from "@liberfi.io/utils";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { CameraIcon } from "@liberfi/ui-base";
import { searchImageUrl } from "../../libs";

type TokenProps = Pick<Partial<Token>, "chain" | "symbol" | "name" | "address" | "imageUrl"> & {
  marketData?: Pick<TokenMarketData, "completionRatio">;
  extra?: Pick<TokenExtraDTO, "launchFromProtocolFamily" | "launchFromProgramAddress">;
};

export type TokenAvatarProps = {
  // token data to display
  token: TokenProps;
  // whether hover to preview the avatar or not
  enablePreview?: boolean;
  // whether click to search the avatar or not
  enableSearch?: boolean;
  // whether show the bonding curve progress or not
  showProgress?: boolean;
  // whether to show the launch protocol icon or not
  showLaunchedFrom?: boolean;
  // radius of the avatar
  radius?: "none" | "sm" | "md" | "lg";
  // customize the styles
  classNames?: {
    avatar?: string;
    search?: string;
    searchIcon?: string;
    previewAvatar?: string;
    previewSearch?: string;
    previewSearchIcon?: string;
    progress?: string;
  };
};

export function TokenAvatar({
  token,
  enablePreview = true,
  enableSearch = true,
  showProgress = true,
  showLaunchedFrom = true,
  radius,
  classNames,
}: TokenAvatarProps) {
  if (!enablePreview) {
    return (
      <TokenAvatarWrapper
        token={token}
        showProgress={showProgress}
        radius={radius}
        showLaunchedFrom={showLaunchedFrom}
        classNames={classNames}
      >
        <TokenAvatarViewer
          token={token}
          enableSearch={enableSearch}
          radius={radius}
          classNames={classNames}
        />
      </TokenAvatarWrapper>
    );
  }
  return (
    <TokenAvatarWrapper
      token={token}
      showProgress={showProgress}
      radius={radius}
      showLaunchedFrom={showLaunchedFrom}
      classNames={classNames}
    >
      <Tooltip
        content={
          <TokenAvatarViewer
            token={token}
            enableSearch={enableSearch}
            radius={radius}
            classNames={{
              avatar: classNames?.previewAvatar ?? "w-60 h-60",
              search: classNames?.previewSearch,
              searchIcon: classNames?.previewSearchIcon ?? "w-10 h-10",
            }}
          />
        }
        placement="bottom-start"
        classNames={{ content: "p-1" }}
      >
        <div>
          <TokenAvatarViewer
            token={token}
            enableSearch={enableSearch}
            radius={radius}
            classNames={classNames}
          />
        </div>
      </Tooltip>
    </TokenAvatarWrapper>
  );
}

function TokenAvatarViewer({
  token,
  enableSearch = true,
  radius = "sm",
  classNames,
}: Pick<TokenAvatarProps, "token" | "enableSearch" | "radius" | "classNames">) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleSearch = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!token.imageUrl) return;
      const url = searchImageUrl(token.imageUrl);
      window.open(url, "_blank");
    },
    [token.imageUrl],
  );

  const fallbackName = useMemo(
    () => (token.symbol ?? token.name ?? token.address ?? "L").slice(0, 1).toUpperCase(),
    [token.symbol, token.name, token.address],
  );

  return (
    <div
      className={clsx("relative overflow-hidden", `rounded-${radius}`, {
        "cursor-pointer": isHovered && enableSearch && token.imageUrl,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Avatar
        showFallback
        src={token.imageUrl}
        name={fallbackName}
        className={clsx(
          `rounded-${radius} bg-content2 text-neutral`,
          "w-8 h-8",
          classNames?.avatar,
        )}
      />

      {/* hover to search */}
      {isHovered && enableSearch && token.imageUrl && (
        <div
          className={clsx(
            `rounded-${radius}`,
            "absolute inset-0 bg-content1/50 flex items-center justify-center",
            classNames?.search,
          )}
          onClick={handleSearch}
        >
          <CameraIcon className={clsx("w-4 h-4", classNames?.searchIcon)} />
        </div>
      )}
    </div>
  );
}

function TokenAvatarWrapper({
  token,
  showLaunchedFrom = true,
  showProgress = true,
  radius = "sm",
  children,
}: PropsWithChildren<
  Pick<TokenAvatarProps, "token" | "showProgress" | "showLaunchedFrom" | "radius" | "classNames">
>) {
  const { chain: chainId } = useCurrentChain();

  const completionRatio = useMemo(() => {
    return token.marketData?.completionRatio
      ? new BigNumber(token.marketData.completionRatio).shiftedBy(2).toNumber()
      : 0;
  }, [token.marketData?.completionRatio]);

  const protocol = useMemo(
    () =>
      token.extra?.launchFromProtocolFamily
        ? getTokenProtocol(
            token.chain ? chainIdBySlug(token.chain) ?? chainId : chainId,
            token.extra.launchFromProtocolFamily,
          )
        : undefined,
    [chainId, token.chain, token.extra?.launchFromProtocolFamily],
  );

  return (
    <div className="relative">
      <div
        className={clsx(`rounded-${radius}`, "relative overflow-hidden", { "p-1.5": showProgress })}
      >
        {showProgress && (
          <ProgressTrack
            className="w-full h-full text-primary absolute inset-0"
            progress={completionRatio}
            color={protocol ? `hsl(var(--color-${protocol}))` : undefined}
          />
        )}
        {children}
      </div>
      {showLaunchedFrom && protocol && (
        <Tooltip
          content={token.extra?.launchFromProtocolFamily}
          classNames={{ content: "text-xs text-neutral py-1.5 px-2" }}
          closeDelay={0}
        >
          <Avatar
            className={clsx(
              "absolute bg-content1 w-4 h-4 bottom-0 right-0 translate-x-1/4 translate-y-1/4",
              "border-1 rounded-full",
            )}
            style={{
              borderColor: `hsl(var(--color-${protocol}))`,
            }}
            src={`/images/protocols/${protocol}.svg`}
          />
        </Tooltip>
      )}
    </div>
  );
}

function ProgressTrack({
  progress = 0,
  className,
  color,
}: {
  progress?: number;
  className?: string;
  color?: string;
}) {
  const strokeDashoffset = useMemo(() => 296 - (progress * 296) / 100, [progress]);

  return (
    <svg viewBox="0 0 78 78" className={className} style={{ color }}>
      <path
        className="opacity-40"
        stroke="currentColor"
        fill="transparent"
        strokeWidth="2"
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
        className="transition-all duration-300 ease-in-out"
        stroke="currentColor"
        fill="transparent"
        strokeWidth="2"
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

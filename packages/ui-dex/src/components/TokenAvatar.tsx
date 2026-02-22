import { Avatar, Image } from "@heroui/react";
import { CHAIN_ID } from "@liberfi/core";
import { ChainImage, MultiChainIcon } from "../assets";
import clsx from "clsx";

export type TokenAvatarProps = {
  src: string;
  size?: number;
  name?: string;
  chainIds?: (string | number)[];
  className?: string;
};

export function TokenAvatar({ src, name, chainIds, size = 24, className }: TokenAvatarProps) {
  return (
    <div className={clsx("relative shrink-0 flex items-center justify-center", className)}>
      {src ? (
        <Image
          width={size}
          height={size}
          src={src}
          alt={name}
          classNames={{ img: "z-0", wrapper: "bg-contain" }}
          // fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(
          //   name ?? "",
          // )}&background=BCFF2E&color=000`}
        />
      ) : (
        <Avatar
          color="primary"
          style={{ width: `${size}px`, height: `${size}px` }}
          name={name?.slice(0, 2)}
        />
      )}
      <div className="absolute -bottom-0.5 -right-1">
        {chainIds?.length === 1 && (
          <ChainImage chainId={`${chainIds[0]}` as CHAIN_ID} width={size / 2} height={size / 2} />
        )}
        {chainIds && chainIds.length > 1 && (
          <MultiChainIcon width={size / 2} height={size / 2} className="text-primary/80" />
        )}
      </div>
    </div>
  );
}

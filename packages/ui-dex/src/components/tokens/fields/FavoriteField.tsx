import { Button } from "@heroui/react";
import { FavoriteOutlinedIcon, FavoriteFilledIcon } from "@/assets";
import { ListField } from "@/components/ListField";
import clsx from "clsx";
import { Token } from "@chainstream-io/sdk";

export interface FavoriteFieldProps {
  token: Token;
  isFavorite: boolean;
  onAction?: () => void;
  className?: string;
}

export function FavoriteField({ isFavorite, onAction, className }: FavoriteFieldProps) {
  return (
    <ListField width={44} grow={false} className={className}>
      <div className="flex items-center justify-center">
        <Button
          isIconOnly
          className={clsx("flex w-8 h-8 min-w-0 min-h-0 rounded-full bg-transparent")}
          disableRipple
          onPress={onAction}
        >
          {isFavorite ? (
            <FavoriteFilledIcon width={20} height={20} />
          ) : (
            <FavoriteOutlinedIcon width={20} height={20} className="text-neutral" />
          )}
        </Button>
      </div>
    </ListField>
  );
}

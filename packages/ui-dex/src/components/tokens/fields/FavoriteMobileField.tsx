import { Button } from "@heroui/react";
import { FavoriteFilledIcon, FavoriteOutlinedIcon } from "../../../assets";
import { ListField } from "../../ListField";
import clsx from "clsx";
import { FavoriteFieldProps } from "./FavoriteField";

export function FavoriteMobileField({ isFavorite, onAction, className }: FavoriteFieldProps) {
  return (
    <ListField width={32} grow={false} className={className}>
      <div className="flex items-center justify-center">
        <Button
          isIconOnly
          className={clsx("flex w-5 h-5 min-w-0 min-h-0 rounded-full bg-transparent")}
          disableRipple
          onPress={onAction}
        >
          {isFavorite ? (
            <FavoriteFilledIcon width={18} height={18} />
          ) : (
            <FavoriteOutlinedIcon width={18} height={18} />
          )}
        </Button>
      </div>
    </ListField>
  );
}

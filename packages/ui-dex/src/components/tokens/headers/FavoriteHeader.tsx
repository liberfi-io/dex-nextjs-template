import { FavoriteOutlinedIcon } from "../../../assets";
import { ListHeader } from "../../ListHeader";
import { Button } from "@heroui/react";

export type FavoriteHeaderProps = {
  className?: string;
};

export function FavoriteHeader({ className }: FavoriteHeaderProps) {
  return (
    <ListHeader width={44} grow={false} className={className}>
      <div className="flex items-center justify-center">
        <Button
          isIconOnly
          className="flex w-8 min-w-0 h-8 min-h-0 bg-transparent"
          disableRipple
        >
          <FavoriteOutlinedIcon width={20} height={20} />
        </Button>
      </div>
    </ListHeader>
  );
}

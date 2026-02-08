import { ViewListOutlinedIcon } from "@/assets";
import { ListHeader } from "@/components/ListHeader";
import { Button } from "@heroui/react";

export type ViewListHeaderProps = {
  className?: string;
};

export function ViewListHeader({ className }: ViewListHeaderProps) {
  return (
    <ListHeader width={44} grow={false} className={className}>
      <div className="flex items-center justify-center">
        <Button
          isIconOnly
          className="flex w-8 min-w-0 h-8 min-h-0 bg-transparent"
          disableRipple
        >
          <ViewListOutlinedIcon width={20} height={20} />
        </Button>
      </div>
    </ListHeader>
  );
}

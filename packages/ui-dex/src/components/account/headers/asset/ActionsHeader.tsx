import { ListHeader } from "@/components/ListHeader";

export type ActionsHeaderProps = {
  className?: string;
};

export function ActionsHeader({ className }: ActionsHeaderProps) {
  return <ListHeader width={50} className={className} shrink></ListHeader>;
}

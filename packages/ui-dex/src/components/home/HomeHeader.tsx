import clsx from "clsx";
import { AccountOverview } from "./AccountOverview";
import { InvitePromotion } from "./InvitePromotion";
import { Slider } from "./Slider";

export type HomeHeaderProps = {
  className?: string;
  classNames?: {
    accountOverview?: string;
    slider?: string;
    invitePromotion?: string;
  };
};

export function HomeHeader({ className, classNames }: HomeHeaderProps) {
  return (
    <div
      className={clsx(
        "w-full lg:h-[160px] flex flex-col lg:flex-row lg:gap-3 lg:justify-between",
        className,
      )}
    >
      <div
        className={clsx(
          "w-full lg:h-full lg:min-w-[400px] lg:max-w-[500px] xl:max-w-[550px] lg:bg-content1 rounded-lg overflow-hidden",
          classNames?.accountOverview,
        )}
      >
        <AccountOverview />
      </div>
      <div
        className={clsx(
          "w-full lg:h-full lg:min-w-[580px] max-lg:my-5 lg:bg-content1 rounded-lg overflow-hidden",
          classNames?.slider,
        )}
      >
        <Slider />
      </div>
      <div
        className={clsx(
          "w-full lg:h-full max-w-[396px] hidden xl:block lg:bg-content1 rounded-lg overflow-hidden",
          classNames?.invitePromotion,
        )}
      >
        <InvitePromotion />
      </div>
    </div>
  );
}

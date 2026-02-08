import clsx from "clsx";
import { PropsWithChildren } from "react";
import { useAuth, useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";

export type AuthGuardProps = PropsWithChildren<{
  className?: string;
}>;

export function AuthGuard({ children, className }: AuthGuardProps) {
  const { t } = useTranslation();
  const { user, signIn, status } = useAuth();

  return !user ? (
    <div className={clsx("flex flex-col items-center px-4 py-8 lg:py-20 gap-4", className)}>
      <p className="text-sm text-neutral text-center">{t("extend.common.unauthenticated")}</p>
      <Button
        variant="bordered"
        className="flex rounded-lg text-neutral border-content3"
        onPress={signIn}
        disableRipple
        isLoading={status === "authenticating"}
      >
        {t("extend.common.signin")}
      </Button>
    </div>
  ) : (
    children
  );
}

import { Key, useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { clsx } from "clsx";
import { BigNumber } from "bignumber.js";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Skeleton,
} from "@heroui/react";
import { formatAmountUSD, ROUTES } from "@liberfi/core";
import {
  ChevronDownIcon,
  SignInIcon,
  SignOutIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  useAppSdk,
  useAuth,
  useAuthenticatedCallback,
  UserIcon,
  useRouter,
  useTranslation,
  walletBalancesAtom,
  WalletIcon,
} from "@liberfi/ui-base";

export function HeaderAccountInfo() {
  const { status } = useAuth();
  return (
    <div className="max-lg:hidden">
      {status === "authenticating" && <Authenticating />}
      {status === "unauthenticated" && <Signin />}
      {status === "authenticated" && <Authenticated />}
    </div>
  );
}

function Authenticated() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { navigate } = useRouter();

  const { signOut } = useAuth();

  const wallet = useAtomValue(walletBalancesAtom);

  const bullish = useMemo(
    () => new BigNumber(wallet?.totalProfitInUsd ?? 0).gte(0),
    [wallet?.totalProfitInUsd],
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenSettings = useAuthenticatedCallback(
    () => appSdk.events.emit("settings:open"),
    [appSdk],
  );

  const handleOpenWallet = useAuthenticatedCallback(
    () => navigate(ROUTES.account.home()),
    [navigate],
  );

  const handleAction = useCallback(
    (key: Key) => {
      switch (key) {
        case "account_wallet":
          handleOpenWallet();
          break;
        case "account_settings":
          handleOpenSettings();
          break;
        case "signout":
          signOut();
          break;
      }
    },
    [handleOpenSettings, handleOpenWallet, signOut],
  );

  if (!wallet) {
    return <Authenticating />;
  }

  return (
    <Dropdown
      placement="bottom-end"
      size="sm"
      classNames={{ content: "rounded-lg" }}
      onOpenChange={setIsOpen}
    >
      <DropdownTrigger>
        <Button
          className="h-10 min-h-0 px-3 gap-3 rounded bg-content1"
          disableRipple
          startContent={<Image width={24} height={24} src="/avatar.jpg" alt="Avatar" />}
          endContent={
            <ChevronDownIcon
              width={16}
              height={16}
              className={clsx("text-neutral transition-transform", { "-rotate-180": isOpen })}
            />
          }
        >
          <div className="flex flex-col items-start">
            <p className="text-xs">{formatAmountUSD(wallet?.totalBalancesInUsd ?? 0)}</p>
            <p
              className="flex items-center gap-0.5 text-xxs text-bearish data-[bullish=true]:text-bullish"
              data-bullish={bullish}
            >
              {bullish ? (
                <TriangleUpIcon width={8} height={8} />
              ) : (
                <TriangleDownIcon width={8} height={8} />
              )}
              <span>{formatAmountUSD(wallet?.totalProfitInUsd ?? 0)}</span>
            </p>
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label={t("extend.header.account")} onAction={handleAction}>
        <DropdownItem
          key="account_wallet"
          startContent={<WalletIcon width={16} height={16} />}
          classNames={{
            base: "text-neutral data-[hover=true]:bg-content3 data-[selectable=true]:focus:bg-content3",
          }}
          aria-label={t("extend.header.account_wallet")}
        >
          {t("extend.header.account_wallet")}
        </DropdownItem>
        <DropdownItem
          key="account_settings"
          startContent={<UserIcon width={16} height={16} />}
          classNames={{
            base: "text-neutral data-[hover=true]:bg-content3 data-[selectable=true]:focus:bg-content3",
          }}
          aria-label={t("extend.header.account_settings")}
        >
          {t("extend.header.account_settings")}
        </DropdownItem>
        <DropdownItem
          key="signout"
          startContent={<SignOutIcon width={16} height={16} />}
          classNames={{
            base: "text-danger-500 data-[hover=true]:bg-content3 data-[hover=true]:text-danger-500 data-[selectable=true]:focus:bg-content3 data-[selectable=true]:focus:text-danger-500",
          }}
          aria-label={t("extend.auth.signout")}
        >
          {t("extend.auth.signout")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

const Signin = () => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  return (
    <Button
      className="h-7 min-h-0 rounded"
      color="primary"
      disableRipple
      onPress={signIn}
      startContent={<SignInIcon width={16} height={16} />}
      aria-label={t("extend.auth.signin")}
    >
      {t("extend.auth.signin")}
    </Button>
  );
};

const Authenticating = () => {
  return (
    <div className="w-36 h-10 px-3 rounded bg-content1 flex items-center gap-3">
      <Skeleton className="w-6 h-6 rounded-full" />
      <div className="flex flex-col items-start">
        <div className="w-12 h-4 flex items-center">
          <Skeleton className="w-full h-3 rounded" />
        </div>
        <div className="w-16 h-3 flex items-center">
          <Skeleton className="w-full h-2.5 rounded" />
        </div>
      </div>
    </div>
  );
};

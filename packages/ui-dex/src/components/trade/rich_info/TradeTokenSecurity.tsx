import { GoPlusIcon, TooltipIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";
import { Button, Link, Popover, PopoverContent, PopoverTrigger, Skeleton } from "@heroui/react";
import { CHAIN_ID, chainIdBySlug } from "@liberfi/core";
import { useTokenSecurityQuery } from "@liberfi/react-dex";
import clsx from "clsx";
import { useMemo } from "react";

const SECURITY_PROVIDER = "GoPlus";

export function TradeTokenSecurity({ token }: { token: Token }) {
  const chain = useMemo(() => chainIdBySlug(token.chain) ?? CHAIN_ID.SOLANA, [token.chain]);

  const { data, isLoading } = useTokenSecurityQuery(chain, token.address);

  const { t } = useTranslation();

  const transferFee = useMemo(
    () => (data?.transfer_fee ? Object.values(data.transfer_fee).length > 0 : false),
    [data],
  );

  const transferFeeNonUpgradable = useMemo(
    () => !data?.transfer_fee_upgradable || data.transfer_fee_upgradable.status === "0",
    [data],
  );

  const noTransactionRestriction = useMemo(
    () => !data?.non_transferable || data.non_transferable === "0",
    [data],
  );

  const noMintFunction = useMemo(() => !data?.mintable || data.mintable.status === "0", [data]);

  const noFreezeFunction = useMemo(() => !data?.freezable || data.freezable.status === "0", [data]);

  const programNotClosable = useMemo(() => !data?.closable || data.closable.status === "0", [data]);

  const notNonTransferableToken = useMemo(
    () => !data?.non_transferable || data.non_transferable === "0",
    [data],
  );

  const balanceNotMutable = useMemo(
    () => !data?.balance_mutable_authority || data.balance_mutable_authority.status === "0",
    [data],
  );

  const noExternalHook = useMemo(
    () => !data?.transfer_hook_upgradable || data.transfer_hook_upgradable.status === "0",
    [data],
  );

  const safe = useMemo(
    () =>
      !transferFee &&
      transferFeeNonUpgradable &&
      noTransactionRestriction &&
      noMintFunction &&
      noFreezeFunction &&
      programNotClosable &&
      notNonTransferableToken &&
      balanceNotMutable &&
      noExternalHook,
    [
      transferFee,
      transferFeeNonUpgradable,
      noTransactionRestriction,
      noMintFunction,
      noFreezeFunction,
      programNotClosable,
      notNonTransferableToken,
      balanceNotMutable,
      noExternalHook,
    ],
  );

  if (isLoading || !data) return <TradeTokenSecuritySkeleton />;

  return (
    <div className="w-full">
      <span className="text-sm font-medium">
        {`${t("extend.trade.about.security")}: `}
        <span
          className={clsx(
            safe === undefined ? "text-neutral" : safe ? "text-success-500" : "text-danger-500",
          )}
        >
          {safe === undefined ? "-" : safe ? t("extend.common.safe") : t("extend.common.unsafe")}
        </span>
      </span>
      <div className="mt-3 flex w-full flex-col">
        <SecurityItem
          title={t("extend.trade.about.securities.transfer_fee")}
          value={transferFee ? t("extend.common.yes") : t("extend.common.no")}
          safe={!transferFee}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.transfer_fee_non_upgradable")}
          explain={t("extend.trade.about.securities.transfer_fee_non_upgradable_explained")}
          value={transferFeeNonUpgradable ? t("extend.common.yes") : t("extend.common.no")}
          safe={transferFeeNonUpgradable}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.no_transaction_restriction")}
          explain={t("extend.trade.about.securities.no_transaction_restriction_explained")}
          value={noTransactionRestriction ? t("extend.common.none") : t("extend.common.yes")}
          safe={noTransactionRestriction}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.no_mint_function")}
          explain={t("extend.trade.about.securities.no_mint_function_explained")}
          value={noMintFunction ? t("extend.common.yes") : t("extend.common.no")}
          safe={noMintFunction}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.no_freeze_function")}
          explain={t("extend.trade.about.securities.no_freeze_function_explained")}
          value={noFreezeFunction ? t("extend.common.yes") : t("extend.common.no")}
          safe={noFreezeFunction}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.program_not_closable")}
          explain={t("extend.trade.about.securities.program_not_closable_explained")}
          value={programNotClosable ? t("extend.common.yes") : t("extend.common.no")}
          safe={programNotClosable}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.not_non_transferable")}
          explain={t("extend.trade.about.securities.not_non_transferable_explained")}
          value={notNonTransferableToken ? t("extend.common.yes") : t("extend.common.no")}
          safe={notNonTransferableToken}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.balance_not_mutable")}
          explain={t("extend.trade.about.securities.balance_not_mutable_explained")}
          value={balanceNotMutable ? t("extend.common.yes") : t("extend.common.no")}
          safe={balanceNotMutable}
        />
        <SecurityItem
          title={t("extend.trade.about.securities.no_external_hook")}
          explain={t("extend.trade.about.securities.no_external_hook_explained")}
          value={noExternalHook ? t("extend.common.yes") : t("extend.common.no")}
          safe={noExternalHook}
        />
      </div>
      <div className="mt-3 flex justify-center">
        <Button
          as={Link}
          href={`https://gopluslabs.io/token-security/${token.chain}/${token.address}`}
          target="_blank"
          disableRipple
          startContent={<GoPlusIcon className="inline-block relative bottom-0.5" />}
          className="bg-transparent gap-1 min-h-0 h-5 text-sm"
        >
          {SECURITY_PROVIDER}
        </Button>
      </div>
    </div>
  );
}

function SecurityItem({
  title,
  explain,
  value,
  safe,
}: {
  title: string;
  explain?: string;
  value: string;
  safe: boolean | undefined;
}) {
  return (
    <div className="h-8 flex items-center justify-between">
      <div className="text-xs text-neutral flex items-center gap-1">
        {title}
        {explain && (
          <Popover classNames={{ content: "p-0 bg-content2" }}>
            <PopoverTrigger>
              <Button
                isIconOnly
                className="flex bg-transparent min-w-8 w-8 min-h-8 h-8 text-neutral rounded-full"
                disableRipple
              >
                <TooltipIcon width={16} height={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="max-w-[300px] p-2 text-xs text-neutral">{explain}</div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className={safe ? "text-xs text-success-500" : "text-xs text-danger-500"}>{value}</div>
    </div>
  );
}

export function TradeTokenSecuritySkeleton() {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <span className="text-sm font-medium">{`${t("extend.trade.about.security")}: `}</span>
      <div className="mt-3 flex w-full flex-col">
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
        <div className="w-full h-8 flex items-center">
          <Skeleton className="rounded-lg w-full h-4" />
        </div>
      </div>
    </div>
  );
}

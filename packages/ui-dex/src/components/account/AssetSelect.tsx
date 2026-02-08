import { WalletBalanceDetailDTO } from "@chainstream-io/sdk";
import { Listbox, ListboxItem, Skeleton } from "@heroui/react";
import { CONFIG, CHAIN_ID } from "@liberfi/core";
import { useTranslation, walletBalancesAtom } from "@liberfi/ui-base";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { EmptyData } from "../EmptyData";
import { Number } from "../Number";
import { TokenAvatar } from "../TokenAvatar";

type AssetSelectProps = {
  chainId?: CHAIN_ID;
  exceptTokenAddresses?: string[];
  onSelect?: (tokenAddress: string) => void;
  onBuy?: () => void;
  onReceive?: () => void;
};

export function AssetSelect({
  exceptTokenAddresses = [],
  onSelect,
  onBuy,
  onReceive,
}: AssetSelectProps) {
  return (
    <List
      exceptTokenAddresses={exceptTokenAddresses}
      onSelect={onSelect}
      onBuy={onBuy}
      onReceive={onReceive}
    />
  );
}

function List({ exceptTokenAddresses = [], onSelect, onBuy, onReceive }: AssetSelectProps) {
  const wallet = useAtomValue(walletBalancesAtom);

  const balances = useMemo(() => {
    if (!wallet) return [];
    return (
      (wallet.balances ?? [])
        // 过滤掉余额为0
        .filter((it) => new BigNumber(it.valueInUsd).gt(0))
        // 过滤掉不可用的代币
        .filter((it) => !exceptTokenAddresses.includes(it.tokenAddress))
        // 按余额由多到少排序
        .sort((a, b) => new BigNumber(b.valueInUsd).minus(a.valueInUsd).toNumber())
    );
  }, [wallet, exceptTokenAddresses]);

  if (!wallet) {
    return <Skeletons />;
  }

  if (balances.length === 0) {
    return <Empty onBuy={onBuy} onReceive={onReceive} />;
  }

  return (
    <Listbox
      className="w-full overflow-x-hidden"
      classNames={{ base: "p-0 pb-4 lg:pb-6 overflow-y-auto", list: "gap-0" }}
    >
      {balances.map((it) => (
        <ListboxItem
          key={it.tokenAddress}
          className={clsx(
            "rounded-none p-0",
            "data-[hover=true]:bg-transparent",
            "data-[selectable=true]:focus:bg-transparent",
          )}
          onPress={() => onSelect?.(it.tokenAddress)}
        >
          <ListItem balance={it} />
        </ListboxItem>
      ))}
    </Listbox>
  );
}

type ListItemProps = {
  balance: WalletBalanceDetailDTO;
};

function ListItem({ balance }: ListItemProps) {
  return (
    <div className="w-full h-14 flex items-center gap-2">
      {balance.imageUrl ? (
        <div className="flex-0">
          <TokenAvatar src={balance.imageUrl} name={balance.symbol} size={32} />
        </div>
      ) : (
        <Skeleton className="flex-0 w-8 h-8 rounded-full" />
      )}
      <div className="flex-1 h-full flex justify-between items-center gap-2 border-b border-content3">
        <div className="text-sm text-foreground font-medium">{balance.symbol}</div>
        <div className="flex flex-col items-end gap-2 text-xs">
          <div className="text-foreground">
            <Number value={balance.valueInUsd ?? 0} abbreviate defaultCurrencySign="$" />
          </div>
          <div className="text-neutral">
            <Number value={balance.amount ?? 0} abbreviate /> <span>{balance.symbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="pb-4 lg:pb-6">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-14 py-2">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function Empty({ onBuy, onReceive }: Pick<AssetSelectProps, "onBuy" | "onReceive">) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-8 lg:py-20 gap-2">
      <EmptyData />
      <p className="text-neutral text-xs">
        <span className="text-primary cursor-pointer" onClick={onBuy}>
          {t("extend.account.add_cash")}
        </span>{" "}
        {t("extend.common.or")}{" "}
        <span className="text-primary cursor-pointer" onClick={onReceive}>
          {t("extend.account.receive")}
        </span>{" "}
        {t("extend.account.assets.empty_tip", {
          title: CONFIG.branding.name,
        })}
      </p>
    </div>
  );
}

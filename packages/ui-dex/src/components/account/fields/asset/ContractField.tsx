import { ListField } from "@/components/ListField";
import { ChainAddress } from "@/components/ChainAddress";
import { Token, WalletBalanceDetailDTO } from "@chainstream-io/sdk";

export interface ContractFieldProps {
  className?: string;
  token?: Token;
  balance: WalletBalanceDetailDTO;
}

export function ContractField({ className, balance }: ContractFieldProps) {
  return (
    <ListField grow={false} shrink={false} className={className}>
      <div className="flex items-center justify-end">
        <ChainAddress address={balance.tokenAddress} />
      </div>
    </ListField>
  );
}

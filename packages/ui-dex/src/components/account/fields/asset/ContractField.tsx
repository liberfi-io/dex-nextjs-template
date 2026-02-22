import { ListField } from "../../../ListField";
import { ChainAddress } from "../../../ChainAddress";
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";

export interface ContractFieldProps {
  className?: string;
  token?: Token;
  balance: WalletNetWorthItemDTO;
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

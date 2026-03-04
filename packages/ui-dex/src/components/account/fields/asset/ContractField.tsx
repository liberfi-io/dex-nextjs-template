import { ListField } from "../../../ListField";
import { ChainAddress } from "../../../ChainAddress";
import { Token } from "@chainstream-io/sdk";
import { PortfolioPnl } from "@liberfi.io/types";

export interface ContractFieldProps {
  className?: string;
  token?: Token;
  balance: PortfolioPnl;
}

export function ContractField({ className, balance }: ContractFieldProps) {
  return (
    <ListField grow={false} shrink={false} className={className}>
      <div className="flex items-center justify-end">
        <ChainAddress address={balance.address} />
      </div>
    </ListField>
  );
}

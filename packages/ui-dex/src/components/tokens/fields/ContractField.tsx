import { ChainAddress } from "../../ChainAddress";
import { ListField } from "../../ListField";
import { Token } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";

interface ContractFieldProps {
  className?: string;
  token: Token;
}

export function ContractField({ className, token }: ContractFieldProps) {
  return (
    <ListField width={105} className={className}>
      <ChainAddress
        address={token.address}
        chainId={Chain[token.chain.toUpperCase() as keyof typeof Chain]}
      />
    </ListField>
  );
}

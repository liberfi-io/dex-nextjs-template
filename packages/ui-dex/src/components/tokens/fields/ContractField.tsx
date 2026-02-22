import { ChainAddress } from "../../ChainAddress";
import { ListField } from "../../ListField";
import { Token } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";

interface ContractFieldProps {
  className?: string;
  token: Token;
}

export function ContractField({ className, token }: ContractFieldProps) {
  return (
    <ListField width={105} className={className}>
      <ChainAddress
        address={token.address}
        chainId={CHAIN_ID[token.chain.toUpperCase() as keyof typeof CHAIN_ID]}
      />
    </ListField>
  );
}

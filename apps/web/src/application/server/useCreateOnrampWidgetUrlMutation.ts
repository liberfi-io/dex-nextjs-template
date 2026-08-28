import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";
import {
  createOnrampWidgetUrl,
  type CreateOnrampWidgetUrlBody,
  type CreateOnrampWidgetUrlResult,
} from "./onrampRestClient";

export function chainToOnrampNetwork(chain: Chain): string | undefined {
  switch (chain) {
    case Chain.SOLANA:
      return "solana";
    case Chain.ETHEREUM:
      return "ethereum";
    case Chain.BINANCE:
      return "bsc";
    default:
      return undefined;
  }
}

export interface CreateOnrampWidgetUrlInput {
  chain: Chain;
  walletAddress: string;
  cryptoCurrency?: string;
  fiatCurrency?: string;
  fiatAmount?: number;
  provider?: string;
  widgetParams?: Record<string, unknown>;
}

export function buildCreateOnrampWidgetUrlBody(
  input: CreateOnrampWidgetUrlInput,
): CreateOnrampWidgetUrlBody {
  const widgetParams: Record<string, unknown> = {
    walletAddress: input.walletAddress,
  };

  const network = chainToOnrampNetwork(input.chain);
  if (network) {
    widgetParams.network = network;
  }
  if (input.cryptoCurrency) {
    widgetParams.defaultCryptoCurrency = input.cryptoCurrency;
  }
  if (input.fiatCurrency) {
    widgetParams.fiatCurrency = input.fiatCurrency;
  }
  if (input.fiatAmount !== undefined) {
    widgetParams.defaultFiatAmount = input.fiatAmount;
  }
  if (input.widgetParams) {
    Object.assign(widgetParams, input.widgetParams);
  }

  return {
    provider: input.provider,
    widgetParams,
  };
}

export const useCreateOnrampWidgetUrlMutation = (
  options: Omit<
    UseMutationOptions<CreateOnrampWidgetUrlResult, Error, CreateOnrampWidgetUrlInput>,
    "mutationFn"
  > = {},
) => {
  return useMutation({
    ...options,
    mutationFn: async (input: CreateOnrampWidgetUrlInput) => {
      return await createOnrampWidgetUrl(buildCreateOnrampWidgetUrlBody(input));
    },
  });
};

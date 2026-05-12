import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";

import {
  CreateOnrampWidgetUrlBody,
  CreateOnrampWidgetUrlResult,
  createOnrampWidgetUrl,
} from "./onrampRestClient";

/**
 * Map the SDK `Chain` enum to the network slug accepted by the onramp
 * provider's widget. The string travels untouched from the browser →
 * dex-server → provider, so it must match the provider's vocabulary.
 *
 * Today the only configured provider is Transak, which uses these
 * lowercase slugs in its `widgetParams.network` field. If a future
 * provider expects different values, lift this mapping out of the hook
 * (e.g. pass it in as part of the input) so the strategy stays open for
 * extension.
 *
 * Returns `undefined` for chains the provider has not been configured
 * for; callers MUST handle that case before issuing the request.
 */
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

/**
 * Input for `useCreateOnrampWidgetUrlMutation`.
 *
 * Required:
 *   - `chain`: drives the `network` widget param.
 *   - `walletAddress`: destination wallet for the on-ramp purchase.
 *
 * Optional structured params. Each is forwarded as the corresponding
 * Transak widget param when present, and omitted otherwise so the
 * provider can apply its own default (e.g. show a token / currency
 * picker):
 *   - `cryptoCurrency`: token the user receives (e.g. `"SOL"`, `"USDT"`).
 *   - `fiatCurrency`:   currency the user pays in (e.g. `"USD"`).
 *   - `fiatAmount`:     prefilled amount on the widget.
 *
 * Optional escape hatches:
 *   - `provider`:     override the dex-server's default provider.
 *   - `widgetParams`: shallow-merged on top of the structured fields so
 *                     callers can pass provider-specific knobs (e.g.
 *                     `themeColor`, `partnerOrderId`) without changing
 *                     the hook signature.
 */
export interface CreateOnrampWidgetUrlInput {
  chain: Chain;
  walletAddress: string;
  cryptoCurrency?: string;
  fiatCurrency?: string;
  fiatAmount?: number;
  provider?: string;
  widgetParams?: Record<string, unknown>;
}

/**
 * Build the request body shipped to dex-server. Extracted so unit tests
 * can assert the wire format without spinning up a fetch mock.
 *
 * Optional fields are written only when defined; this keeps the
 * resulting `widgetParams` minimal and lets the on-ramp provider apply
 * its own defaults for the rest.
 */
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

/**
 * Mint a single-use fiat on-ramp widget URL via dex-server.
 *
 * Flow:
 *   1. Component fires the mutation in response to a user click.
 *   2. dex-server validates + signs the request with the provider's API
 *      credentials and returns `{ provider, widgetUrl, expiresAt }`.
 *   3. Component opens `widgetUrl` (single-use; valid for ~5 minutes on
 *      Transak).
 *
 * Common popup-blocker workaround for step 3: open `about:blank` in
 * response to the user click first, then set the new tab's location to
 * `widgetUrl` once the mutation resolves.
 */
export const useCreateOnrampWidgetUrlMutation = (
  options: Omit<
    UseMutationOptions<
      CreateOnrampWidgetUrlResult,
      Error,
      CreateOnrampWidgetUrlInput
    >,
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

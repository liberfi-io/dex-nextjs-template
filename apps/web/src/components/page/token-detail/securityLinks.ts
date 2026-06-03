import { Chain } from "@liberfi.io/types";

export type SecurityProviderKey = "goplus" | "honeypot" | "serialized";

export interface SecurityProviderLink {
  key: SecurityProviderKey;
  label: string;
  href: string;
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
}

const GOPLUS_ICON = "/goplus.svg";
const HONEYPOT_ICON = "/security-auditors/honeypot.svg";
const SERIALIZED_ICON = "/security-auditors/serialized-audit.svg";

function buildGoPlusHref(chain: Chain, address: string): string | undefined {
  if (chain === Chain.SOLANA) {
    return `https://console.gopluslabs.io/token-security/solana/${address}`;
  }
  if (chain === Chain.BINANCE) {
    return `https://console.gopluslabs.io/token-security/56/${address}`;
  }
  if (chain === Chain.ETHEREUM) {
    return `https://console.gopluslabs.io/token-security/1/${address}`;
  }
  return undefined;
}

export function buildSecurityProviderLinks(
  chain: Chain,
  address: string,
): SecurityProviderLink[] {
  const links: SecurityProviderLink[] = [];
  const goplusHref = buildGoPlusHref(chain, address);
  if (goplusHref) {
    links.push({
      key: "goplus",
      label: "GoPlus",
      href: goplusHref,
      iconSrc: GOPLUS_ICON,
      iconWidth: 18,
      iconHeight: 15,
    });
  }

  if (chain === Chain.BINANCE) {
    links.push(
      {
        key: "honeypot",
        label: "Honeypot.is",
        href: `https://honeypot.is/?address=${address}`,
        iconSrc: HONEYPOT_ICON,
        iconWidth: 18,
        iconHeight: 18,
      },
      {
        key: "serialized",
        label: "Serialized",
        href: `https://www.serializedaudit.io/bsc/${address}`,
        iconSrc: SERIALIZED_ICON,
        iconWidth: 18,
        iconHeight: 18,
      },
    );
  }

  if (chain === Chain.ETHEREUM) {
    links.push(
      {
        key: "honeypot",
        label: "Honeypot.is",
        href: `https://honeypot.is/ethereum?address=${address}`,
        iconSrc: HONEYPOT_ICON,
        iconWidth: 18,
        iconHeight: 18,
      },
      {
        key: "serialized",
        label: "Serialized",
        href: `https://www.serializedaudit.io/eth/${address}`,
        iconSrc: SERIALIZED_ICON,
        iconWidth: 18,
        iconHeight: 18,
      },
    );
  }

  return links;
}

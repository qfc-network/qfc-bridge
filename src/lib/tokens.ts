export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Record<string, string>;
}

export const TOKENS: TokenConfig[] = [
  {
    symbol: "QFC",
    name: "QFC Token",
    decimals: 18,
    addresses: {
      qfc: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      eth: "0x1111000000000000000000000000000000000001",
      bsc: "0x2222000000000000000000000000000000000001",
    },
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    addresses: {
      qfc: "0x1111000000000000000000000000000000000002",
      eth: "0x1111000000000000000000000000000000000003",
      bsc: "0x2222000000000000000000000000000000000002",
    },
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      qfc: "0x1111000000000000000000000000000000000004",
      eth: "0x1111000000000000000000000000000000000005",
      bsc: "0x2222000000000000000000000000000000000003",
    },
  },
  {
    symbol: "TTK",
    name: "Test Token",
    decimals: 18,
    addresses: {
      qfc: "0x1111000000000000000000000000000000000006",
      eth: "0x1111000000000000000000000000000000000007",
      bsc: "0x2222000000000000000000000000000000000004",
    },
  },
];

export function getToken(symbol: string): TokenConfig | undefined {
  return TOKENS.find((t) => t.symbol === symbol);
}

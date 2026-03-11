export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  bridgeAddress: string;
  explorerUrl: string;
  color: string;
  logo: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  qfc: {
    chainId: 7701,
    name: "QFC Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_QFC_RPC || "https://rpc.testnet.qfc.network",
    bridgeAddress: process.env.NEXT_PUBLIC_BRIDGE_QFC || "",
    explorerUrl: "https://explorer.testnet.qfc.network",
    color: "purple",
    logo: "🟣",
  },
  eth: {
    chainId: 11155111,
    name: "ETH Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC || "https://rpc.sepolia.org",
    bridgeAddress: process.env.NEXT_PUBLIC_BRIDGE_ETH || "",
    explorerUrl: "https://sepolia.etherscan.io",
    color: "blue",
    logo: "🔵",
  },
  bsc: {
    chainId: 97,
    name: "BSC Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
    bridgeAddress: process.env.NEXT_PUBLIC_BRIDGE_BSC || "",
    explorerUrl: "https://testnet.bscscan.com",
    color: "yellow",
    logo: "🟡",
  },
};

export const CHAIN_LIST = Object.entries(CHAINS).map(([key, config]) => ({
  key,
  ...config,
}));

export function getChainByKey(key: string): ChainConfig | undefined {
  return CHAINS[key];
}

export function getChainByChainId(chainId: number): (ChainConfig & { key: string }) | undefined {
  const entry = Object.entries(CHAINS).find(([, c]) => c.chainId === chainId);
  return entry ? { key: entry[0], ...entry[1] } : undefined;
}

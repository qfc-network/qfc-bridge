export interface ChainConfig {
  key: string;
  chainId: number;
  name: string;
  rpcUrl: string;
  bridgeAddress: string;
}

export function loadConfig() {
  const chains: ChainConfig[] = [
    {
      key: "qfc",
      chainId: 7701,
      name: "QFC Testnet",
      rpcUrl: process.env.QFC_RPC_URL || "https://rpc.testnet.qfc.network",
      bridgeAddress: process.env.BRIDGE_ADDRESS_QFC || "",
    },
    {
      key: "eth",
      chainId: 11155111,
      name: "ETH Sepolia",
      rpcUrl: process.env.ETH_RPC_URL || "https://rpc.sepolia.org",
      bridgeAddress: process.env.BRIDGE_ADDRESS_ETH || "",
    },
    {
      key: "bsc",
      chainId: 97,
      name: "BSC Testnet",
      rpcUrl: process.env.BSC_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      bridgeAddress: process.env.BRIDGE_ADDRESS_BSC || "",
    },
  ];

  return {
    chains,
    relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY || "",
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "10000", 10),
    port: parseInt(process.env.PORT || "3295", 10),
  };
}

export type Config = ReturnType<typeof loadConfig>;

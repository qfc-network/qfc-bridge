export interface ChainConfig {
    key: string;
    chainId: number;
    name: string;
    rpcUrl: string;
    bridgeAddress: string;
}
export declare function loadConfig(): {
    chains: ChainConfig[];
    relayerPrivateKey: string;
    pollIntervalMs: number;
    port: number;
};
export type Config = ReturnType<typeof loadConfig>;

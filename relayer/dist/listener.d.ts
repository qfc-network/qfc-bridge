import type { ChainConfig } from "./config";
export declare class ChainListener {
    private provider;
    private contract;
    private chain;
    private lastBlock;
    constructor(chain: ChainConfig);
    init(): Promise<void>;
    poll(): Promise<void>;
}

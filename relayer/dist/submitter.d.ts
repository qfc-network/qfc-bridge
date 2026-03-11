import type { ChainConfig } from "./config";
export declare class Submitter {
    private wallets;
    private contracts;
    constructor(chains: ChainConfig[], privateKey: string);
    processQueue(): Promise<void>;
    private submitRelease;
}

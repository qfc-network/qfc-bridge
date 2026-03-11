"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainListener = void 0;
const ethers_1 = require("ethers");
const db_1 = require("./db");
const BRIDGE_LOCK_ABI = [
    "event BridgeRequest(uint256 indexed nonce, address indexed token, address indexed sender, uint256 amount, uint256 fee, uint256 destChain, address recipient)",
];
const CHAIN_ID_TO_KEY = {
    7701: "qfc",
    11155111: "eth",
    97: "bsc",
};
class ChainListener {
    provider;
    contract;
    chain;
    lastBlock = 0;
    constructor(chain) {
        this.chain = chain;
        this.provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        this.contract = new ethers_1.Contract(chain.bridgeAddress, BRIDGE_LOCK_ABI, this.provider);
    }
    async init() {
        try {
            this.lastBlock = await this.provider.getBlockNumber();
            console.log(`[${this.chain.name}] Initialized at block ${this.lastBlock}`);
        }
        catch (err) {
            console.error(`[${this.chain.name}] Failed to initialize:`, err);
        }
    }
    async poll() {
        try {
            const currentBlock = await this.provider.getBlockNumber();
            if (currentBlock <= this.lastBlock)
                return;
            const fromBlock = this.lastBlock + 1;
            const toBlock = currentBlock;
            console.log(`[${this.chain.name}] Scanning blocks ${fromBlock} - ${toBlock}`);
            const filter = this.contract.filters.BridgeRequest();
            const events = await this.contract.queryFilter(filter, fromBlock, toBlock);
            for (const event of events) {
                if (!("args" in event))
                    continue;
                const args = event.args;
                const { nonce, token, sender, amount, destChain, recipient } = args;
                const destChainKey = CHAIN_ID_TO_KEY[Number(destChain)];
                if (!destChainKey) {
                    console.warn(`[${this.chain.name}] Unknown dest chain ID: ${destChain}`);
                    continue;
                }
                console.log(`[${this.chain.name}] Found BridgeRequest: nonce=${nonce} token=${token} amount=${amount} -> ${destChainKey}`);
                (0, db_1.insertPendingTx)({
                    src_chain: this.chain.key,
                    dest_chain: destChainKey,
                    token,
                    sender,
                    recipient,
                    amount: amount.toString(),
                    nonce: Number(nonce),
                    tx_hash: event.transactionHash,
                    block_number: event.blockNumber,
                    created_at: Date.now(),
                });
            }
            this.lastBlock = toBlock;
        }
        catch (err) {
            console.error(`[${this.chain.name}] Poll error:`, err);
        }
    }
}
exports.ChainListener = ChainListener;

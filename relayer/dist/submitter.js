"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submitter = void 0;
const ethers_1 = require("ethers");
const db_1 = require("./db");
const BRIDGE_LOCK_ABI = [
    "function unlock(address _token, address _recipient, uint256 _amount, uint256 _srcChain, uint256 _nonce, bytes[] calldata _signatures) external",
];
const KEY_TO_CHAIN_ID = {
    qfc: 7701,
    eth: 11155111,
    bsc: 97,
};
class Submitter {
    wallets = new Map();
    contracts = new Map();
    constructor(chains, privateKey) {
        for (const chain of chains) {
            if (!chain.bridgeAddress)
                continue;
            const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
            const wallet = new ethers_1.Wallet(privateKey, provider);
            this.wallets.set(chain.key, wallet);
            this.contracts.set(chain.key, new ethers_1.Contract(chain.bridgeAddress, BRIDGE_LOCK_ABI, wallet));
        }
    }
    async processQueue() {
        const pending = (0, db_1.getPendingTxs)();
        if (pending.length === 0)
            return;
        console.log(`[Submitter] Processing ${pending.length} pending tx(s)`);
        for (const tx of pending) {
            await this.submitRelease(tx);
        }
    }
    async submitRelease(tx) {
        const contract = this.contracts.get(tx.dest_chain);
        const wallet = this.wallets.get(tx.dest_chain);
        if (!contract || !wallet) {
            console.error(`[Submitter] No contract/wallet for chain ${tx.dest_chain}`);
            (0, db_1.updateTxStatus)(tx.id, "failed");
            return;
        }
        try {
            (0, db_1.updateTxStatus)(tx.id, "submitted");
            const srcChainId = KEY_TO_CHAIN_ID[tx.src_chain];
            // Build simple proof: sign the message hash as relayer
            const messageHash = (0, ethers_1.keccak256)((0, ethers_1.solidityPacked)(["address", "address", "uint256", "uint256", "uint256"], [tx.token, tx.recipient, tx.amount, srcChainId, tx.nonce]));
            const signature = await wallet.signMessage(Buffer.from(messageHash.slice(2), "hex"));
            const receipt = await (await contract.unlock(tx.token, tx.recipient, tx.amount, srcChainId, tx.nonce, [signature])).wait();
            console.log(`[Submitter] Released on ${tx.dest_chain}: ${receipt.hash}`);
            (0, db_1.updateTxStatus)(tx.id, "completed", receipt.hash);
        }
        catch (err) {
            console.error(`[Submitter] Failed to submit tx ${tx.id}:`, err);
            (0, db_1.incrementRetries)(tx.id);
            if (tx.retries + 1 >= 3) {
                (0, db_1.updateTxStatus)(tx.id, "failed");
            }
            else {
                (0, db_1.updateTxStatus)(tx.id, "pending");
            }
        }
    }
}
exports.Submitter = Submitter;

import { JsonRpcProvider, Contract } from "ethers";
import type { ChainConfig } from "./config";
import { insertPendingTx, getDb } from "./db";

const BRIDGE_LOCK_ABI = [
  "event BridgeRequest(uint256 indexed nonce, address indexed token, address indexed sender, uint256 amount, uint256 fee, uint256 destChain, address recipient)",
];

const CHAIN_ID_TO_KEY: Record<number, string> = {
  7701: "qfc",
  11155111: "eth",
  97: "bsc",
};

export class ChainListener {
  private provider: JsonRpcProvider;
  private contract: Contract;
  private chain: ChainConfig;
  private lastBlock: number = 0;

  constructor(chain: ChainConfig) {
    this.chain = chain;
    this.provider = new JsonRpcProvider(chain.rpcUrl);
    this.contract = new Contract(chain.bridgeAddress, BRIDGE_LOCK_ABI, this.provider);
  }

  async init(): Promise<void> {
    try {
      this.lastBlock = await this.provider.getBlockNumber();
      console.log(`[${this.chain.name}] Initialized at block ${this.lastBlock}`);
    } catch (err) {
      console.error(`[${this.chain.name}] Failed to initialize:`, err);
    }
  }

  async poll(): Promise<void> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      if (currentBlock <= this.lastBlock) return;

      const fromBlock = this.lastBlock + 1;
      const toBlock = currentBlock;

      console.log(`[${this.chain.name}] Scanning blocks ${fromBlock} - ${toBlock}`);

      const filter = this.contract.filters.BridgeRequest();
      const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

      for (const event of events) {
        if (!("args" in event)) continue;
        const args = event.args as unknown as {
          nonce: bigint;
          token: string;
          sender: string;
          amount: bigint;
          fee: bigint;
          destChain: bigint;
          recipient: string;
        };
        const { nonce, token, sender, amount, destChain, recipient } = args;

        const destChainKey = CHAIN_ID_TO_KEY[Number(destChain)];
        if (!destChainKey) {
          console.warn(`[${this.chain.name}] Unknown dest chain ID: ${destChain}`);
          continue;
        }

        console.log(`[${this.chain.name}] Found BridgeRequest: nonce=${nonce} token=${token} amount=${amount} -> ${destChainKey}`);

        insertPendingTx({
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
    } catch (err) {
      console.error(`[${this.chain.name}] Poll error:`, err);
    }
  }
}

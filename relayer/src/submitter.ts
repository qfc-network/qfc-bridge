import { JsonRpcProvider, Wallet, Contract } from "ethers";
import type { ChainConfig } from "./config";
import { getPendingTxs, updateTxStatus, incrementRetries, type PendingTx } from "./db";
import { buildRelayProof } from "./prover";

const BRIDGE_LOCK_ABI = [
  "function unlock(address _token, address _recipient, uint256 _amount, uint256 _srcChain, uint256 _nonce, bytes[] calldata _signatures) external",
];

export class Submitter {
  private wallets: Map<string, Wallet> = new Map();
  private contracts: Map<string, Contract> = new Map();

  constructor(chains: ChainConfig[], privateKey: string) {
    for (const chain of chains) {
      if (!chain.bridgeAddress) continue;
      const provider = new JsonRpcProvider(chain.rpcUrl);
      const wallet = new Wallet(privateKey, provider);
      this.wallets.set(chain.key, wallet);
      this.contracts.set(chain.key, new Contract(chain.bridgeAddress, BRIDGE_LOCK_ABI, wallet));
    }
  }

  async processQueue(): Promise<void> {
    const pending = getPendingTxs();
    if (pending.length === 0) return;

    console.log(`[Submitter] Processing ${pending.length} pending tx(s)`);

    for (const tx of pending) {
      await this.submitRelease(tx);
    }
  }

  private async submitRelease(tx: PendingTx): Promise<void> {
    const contract = this.contracts.get(tx.dest_chain);
    const wallet = this.wallets.get(tx.dest_chain);

    if (!contract || !wallet) {
      console.error(`[Submitter] No contract/wallet for chain ${tx.dest_chain}`);
      updateTxStatus(tx.id, "failed");
      return;
    }

    try {
      updateTxStatus(tx.id, "submitted");

      const proof = buildRelayProof(tx);
      const signature = await wallet.signMessage(Buffer.from(proof.leafHash.slice(2), "hex"));

      const receipt = await (
        await contract.unlock(
          tx.token,
          tx.recipient,
          tx.amount,
          proof.srcChainId,
          tx.nonce,
          [signature]
        )
      ).wait();

      console.log(
        `[Submitter] Released on ${tx.dest_chain}: ${receipt.hash} (root=${proof.merkleRoot}, proofLen=${proof.merkleProof.length})`
      );
      updateTxStatus(tx.id, "completed", receipt.hash);
    } catch (err) {
      console.error(`[Submitter] Failed to submit tx ${tx.id}:`, err);
      incrementRetries(tx.id);
      if (tx.retries + 1 >= 3) {
        updateTxStatus(tx.id, "failed");
      } else {
        updateTxStatus(tx.id, "pending");
      }
    }
  }
}

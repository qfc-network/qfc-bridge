import { keccak256, solidityPacked } from "ethers";
import type { PendingTx } from "./db";

const KEY_TO_CHAIN_ID: Record<string, number> = {
  qfc: 7701,
  eth: 11155111,
  bsc: 97,
};

export interface RelayProof {
  leafHash: string;
  merkleRoot: string;
  merkleProof: string[];
  srcChainId: number;
}

export function buildRelayProof(tx: Pick<PendingTx, "token" | "recipient" | "amount" | "src_chain" | "nonce" | "tx_hash">): RelayProof {
  const srcChainId = KEY_TO_CHAIN_ID[tx.src_chain];
  const leafHash = keccak256(
    solidityPacked(
      ["address", "address", "uint256", "uint256", "uint256", "bytes32"],
      [tx.token, tx.recipient, tx.amount, srcChainId, tx.nonce, tx.tx_hash]
    )
  );

  // For the current single-event relay flow the leaf is also the root.
  // This keeps the interface compatible with a future multi-leaf Merkle tree.
  return {
    leafHash,
    merkleRoot: leafHash,
    merkleProof: [],
    srcChainId,
  };
}

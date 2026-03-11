import { type Database } from "sql.js";
export interface PendingTx {
    id: number;
    src_chain: string;
    dest_chain: string;
    token: string;
    sender: string;
    recipient: string;
    amount: string;
    nonce: number;
    tx_hash: string;
    block_number: number;
    status: "pending" | "submitted" | "completed" | "failed";
    retries: number;
    target_tx_hash: string | null;
    created_at: number;
    updated_at: number;
}
export declare function initDb(): Promise<Database>;
export declare function getDb(): Database;
export declare function insertPendingTx(tx: Omit<PendingTx, "id" | "status" | "retries" | "target_tx_hash" | "updated_at">): void;
export declare function getPendingTxs(): PendingTx[];
export declare function updateTxStatus(id: number, status: string, targetTxHash?: string): void;
export declare function incrementRetries(id: number): void;
export declare function getCompletedToday(): number;
export declare function getPendingCount(): number;
export declare function getAvgBridgeTime(): number;

import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import path from "path";

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

let db: Database;
const DB_PATH = path.join(process.cwd(), "relayer.db");

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS pending_txs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      src_chain TEXT NOT NULL,
      dest_chain TEXT NOT NULL,
      token TEXT NOT NULL,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      amount TEXT NOT NULL,
      nonce INTEGER NOT NULL,
      tx_hash TEXT NOT NULL UNIQUE,
      block_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      retries INTEGER NOT NULL DEFAULT 0,
      target_tx_hash TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_status ON pending_txs(status)");
  db.run("CREATE INDEX IF NOT EXISTS idx_src_chain ON pending_txs(src_chain)");

  save();
  return db;
}

export function getDb(): Database {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

export function insertPendingTx(tx: Omit<PendingTx, "id" | "status" | "retries" | "target_tx_hash" | "updated_at">): void {
  getDb().run(
    `INSERT OR IGNORE INTO pending_txs (src_chain, dest_chain, token, sender, recipient, amount, nonce, tx_hash, block_number, status, retries, target_tx_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NULL, ?, ?)`,
    [tx.src_chain, tx.dest_chain, tx.token, tx.sender, tx.recipient, tx.amount, tx.nonce, tx.tx_hash, tx.block_number, tx.created_at, tx.created_at]
  );
  save();
}

export function getPendingTxs(): PendingTx[] {
  const results = getDb().exec("SELECT * FROM pending_txs WHERE status IN ('pending', 'submitted') AND retries < 3 ORDER BY created_at ASC");
  if (results.length === 0) return [];
  const cols = results[0].columns;
  return results[0].values.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj as unknown as PendingTx;
  });
}

export function updateTxStatus(id: number, status: string, targetTxHash?: string): void {
  const now = Date.now();
  if (targetTxHash) {
    getDb().run("UPDATE pending_txs SET status = ?, target_tx_hash = ?, updated_at = ? WHERE id = ?", [status, targetTxHash, now, id]);
  } else {
    getDb().run("UPDATE pending_txs SET status = ?, updated_at = ? WHERE id = ?", [status, now, id]);
  }
  save();
}

export function incrementRetries(id: number): void {
  getDb().run("UPDATE pending_txs SET retries = retries + 1, updated_at = ? WHERE id = ?", [Date.now(), id]);
  save();
}

export function getCompletedToday(): number {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const results = getDb().exec(`SELECT COUNT(*) as count FROM pending_txs WHERE status = 'completed' AND updated_at >= ${startOfDay.getTime()}`);
  return results.length > 0 ? (results[0].values[0][0] as number) : 0;
}

export function getPendingCount(): number {
  const results = getDb().exec("SELECT COUNT(*) as count FROM pending_txs WHERE status IN ('pending', 'submitted')");
  return results.length > 0 ? (results[0].values[0][0] as number) : 0;
}

export function getAvgBridgeTime(): number {
  const results = getDb().exec(
    "SELECT AVG(updated_at - created_at) as avg_time FROM pending_txs WHERE status = 'completed' AND updated_at > created_at"
  );
  if (results.length > 0 && results[0].values[0][0] != null) {
    return results[0].values[0][0] as number;
  }
  return 30000;
}

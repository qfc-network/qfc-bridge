"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getDb = getDb;
exports.insertPendingTx = insertPendingTx;
exports.getPendingTxs = getPendingTxs;
exports.updateTxStatus = updateTxStatus;
exports.incrementRetries = incrementRetries;
exports.getCompletedToday = getCompletedToday;
exports.getPendingCount = getPendingCount;
exports.getAvgBridgeTime = getAvgBridgeTime;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let db;
const DB_PATH = path_1.default.join(process.cwd(), "relayer.db");
function save() {
    const data = db.export();
    fs_1.default.writeFileSync(DB_PATH, Buffer.from(data));
}
async function initDb() {
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_PATH)) {
        const buf = fs_1.default.readFileSync(DB_PATH);
        db = new SQL.Database(buf);
    }
    else {
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
function getDb() {
    if (!db)
        throw new Error("Database not initialized. Call initDb() first.");
    return db;
}
function insertPendingTx(tx) {
    getDb().run(`INSERT OR IGNORE INTO pending_txs (src_chain, dest_chain, token, sender, recipient, amount, nonce, tx_hash, block_number, status, retries, target_tx_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NULL, ?, ?)`, [tx.src_chain, tx.dest_chain, tx.token, tx.sender, tx.recipient, tx.amount, tx.nonce, tx.tx_hash, tx.block_number, tx.created_at, tx.created_at]);
    save();
}
function getPendingTxs() {
    const results = getDb().exec("SELECT * FROM pending_txs WHERE status IN ('pending', 'submitted') AND retries < 3 ORDER BY created_at ASC");
    if (results.length === 0)
        return [];
    const cols = results[0].columns;
    return results[0].values.map((row) => {
        const obj = {};
        cols.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
    });
}
function updateTxStatus(id, status, targetTxHash) {
    const now = Date.now();
    if (targetTxHash) {
        getDb().run("UPDATE pending_txs SET status = ?, target_tx_hash = ?, updated_at = ? WHERE id = ?", [status, targetTxHash, now, id]);
    }
    else {
        getDb().run("UPDATE pending_txs SET status = ?, updated_at = ? WHERE id = ?", [status, now, id]);
    }
    save();
}
function incrementRetries(id) {
    getDb().run("UPDATE pending_txs SET retries = retries + 1, updated_at = ? WHERE id = ?", [Date.now(), id]);
    save();
}
function getCompletedToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const results = getDb().exec(`SELECT COUNT(*) as count FROM pending_txs WHERE status = 'completed' AND updated_at >= ${startOfDay.getTime()}`);
    return results.length > 0 ? results[0].values[0][0] : 0;
}
function getPendingCount() {
    const results = getDb().exec("SELECT COUNT(*) as count FROM pending_txs WHERE status IN ('pending', 'submitted')");
    return results.length > 0 ? results[0].values[0][0] : 0;
}
function getAvgBridgeTime() {
    const results = getDb().exec("SELECT AVG(updated_at - created_at) as avg_time FROM pending_txs WHERE status = 'completed' AND updated_at > created_at");
    if (results.length > 0 && results[0].values[0][0] != null) {
        return results[0].values[0][0];
    }
    return 30000;
}

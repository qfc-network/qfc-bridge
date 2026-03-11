"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const config_1 = require("./config");
const db_1 = require("./db");
const listener_1 = require("./listener");
const submitter_1 = require("./submitter");
async function main() {
    const config = (0, config_1.loadConfig)();
    console.log("🌉 QFC Bridge Relayer starting...");
    console.log(`   Chains: ${config.chains.map((c) => c.name).join(", ")}`);
    console.log(`   Poll interval: ${config.pollIntervalMs}ms`);
    console.log(`   HTTP port: ${config.port}`);
    // Init database
    await (0, db_1.initDb)();
    // Init listeners for each chain
    const listeners = [];
    for (const chain of config.chains) {
        if (!chain.bridgeAddress) {
            console.warn(`   Skipping ${chain.name}: no bridge address configured`);
            continue;
        }
        const listener = new listener_1.ChainListener(chain);
        await listener.init();
        listeners.push(listener);
    }
    // Init submitter
    const submitter = new submitter_1.Submitter(config.chains, config.relayerPrivateKey);
    // Main poll loop
    const runCycle = async () => {
        // Poll all chains for new events
        await Promise.all(listeners.map((l) => l.poll()));
        // Process pending submissions
        await submitter.processQueue();
    };
    setInterval(runCycle, config.pollIntervalMs);
    console.log("🔄 Poll loop started");
    // HTTP status server
    const server = http_1.default.createServer((_req, res) => {
        const status = {
            status: "ok",
            chains: config.chains.map((c) => ({
                key: c.key,
                name: c.name,
                chainId: c.chainId,
                configured: !!c.bridgeAddress,
            })),
            pendingCount: (0, db_1.getPendingCount)(),
            completedToday: (0, db_1.getCompletedToday)(),
            avgBridgeTimeMs: Math.round((0, db_1.getAvgBridgeTime)()),
        };
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        });
        res.end(JSON.stringify(status, null, 2));
    });
    server.listen(config.port, () => {
        console.log(`📡 Status API listening on http://localhost:${config.port}/`);
    });
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});

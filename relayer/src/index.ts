import http from "http";
import { loadConfig } from "./config";
import { initDb, getCompletedToday, getPendingCount, getAvgBridgeTime } from "./db";
import { ChainListener } from "./listener";
import { Submitter } from "./submitter";

async function main() {
  const config = loadConfig();

  console.log("🌉 QFC Bridge Relayer starting...");
  console.log(`   Chains: ${config.chains.map((c) => c.name).join(", ")}`);
  console.log(`   Poll interval: ${config.pollIntervalMs}ms`);
  console.log(`   HTTP port: ${config.port}`);

  // Init database
  await initDb();

  // Init listeners for each chain
  const listeners: ChainListener[] = [];
  for (const chain of config.chains) {
    if (!chain.bridgeAddress) {
      console.warn(`   Skipping ${chain.name}: no bridge address configured`);
      continue;
    }
    const listener = new ChainListener(chain);
    await listener.init();
    listeners.push(listener);
  }

  // Init submitter
  const submitter = new Submitter(config.chains, config.relayerPrivateKey);

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
  const server = http.createServer((_req, res) => {
    const status = {
      status: "ok",
      chains: config.chains.map((c) => ({
        key: c.key,
        name: c.name,
        chainId: c.chainId,
        configured: !!c.bridgeAddress,
      })),
      pendingCount: getPendingCount(),
      completedToday: getCompletedToday(),
      avgBridgeTimeMs: Math.round(getAvgBridgeTime()),
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

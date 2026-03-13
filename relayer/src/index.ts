import http from "http";
import { loadConfig } from "./config";
import {
  initDb,
  getCompletedToday,
  getPendingCount,
  getAvgBridgeTime,
  getLastRelayAt,
  getRecentTxs,
  getTotalVolume,
} from "./db";
import { ChainListener } from "./listener";
import { Submitter } from "./submitter";

async function main() {
  const config = loadConfig();

  console.log("🌉 QFC Bridge Relayer starting...");
  console.log(`   Chains: ${config.chains.map((c) => c.name).join(", ")}`);
  console.log(`   Poll interval: ${config.pollIntervalMs}ms`);
  console.log(`   HTTP port: ${config.port}`);

  await initDb();

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

  const submitter = new Submitter(config.chains, config.relayerPrivateKey);

  const runCycle = async () => {
    await Promise.all(listeners.map((listener) => listener.poll()));
    await submitter.processQueue();
  };

  await runCycle();
  setInterval(runCycle, config.pollIntervalMs);
  console.log("🔄 Poll loop started");

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${config.port}`);

    if (url.pathname === "/health") {
      return json(res, 200, { status: "ok" });
    }

    if (url.pathname === "/history") {
      return json(res, 200, {
        status: "ok",
        items: getRecentTxs(50),
      });
    }

    return json(res, 200, {
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
      totalVolume: getTotalVolume(),
      lastRelayAt: getLastRelayAt(),
    });
  });

  server.listen(config.port, () => {
    console.log(`📡 Status API listening on http://localhost:${config.port}/`);
  });
}

function json(res: http.ServerResponse, statusCode: number, body: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body, null, 2));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

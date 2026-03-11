"use client";

import { useState, useEffect } from "react";
import { CHAIN_LIST } from "@/lib/chains";
import { TOKENS } from "@/lib/tokens";

interface PoolData {
  chain: string;
  token: string;
  balance: number;
  minThreshold: number;
}

interface RelayerStatus {
  online: boolean;
  lastRelay: number;
  relaysToday: number;
  avgBridgeTimeMs: number;
  totalVolume: number;
  pendingCount: number;
}

function generateMockPools(): PoolData[] {
  const pools: PoolData[] = [];
  for (const chain of CHAIN_LIST) {
    for (const token of TOKENS) {
      const balance = Math.random() * 100000 + 5000;
      pools.push({
        chain: chain.key,
        token: token.symbol,
        balance,
        minThreshold: 10000,
      });
    }
  }
  return pools;
}

const MOCK_RELAYER: RelayerStatus = {
  online: true,
  lastRelay: Date.now() - 45000,
  relaysToday: 142,
  avgBridgeTimeMs: 32000,
  totalVolume: 2_456_789,
  pendingCount: 3,
};

export default function StatusPage() {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [relayer, setRelayer] = useState<RelayerStatus>(MOCK_RELAYER);

  useEffect(() => {
    setPools(generateMockPools());
    // Try to fetch real relayer status
    fetch("http://localhost:3295/")
      .then((r) => r.json())
      .then((data) => {
        if (data.status) {
          setRelayer({
            online: data.status === "ok",
            lastRelay: Date.now() - (data.avgBridgeTimeMs || 30000),
            relaysToday: data.completedToday || 0,
            avgBridgeTimeMs: data.avgBridgeTimeMs || 30000,
            totalVolume: MOCK_RELAYER.totalVolume,
            pendingCount: data.pendingCount || 0,
          });
        }
      })
      .catch(() => {
        // Use mock data
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold">Bridge Status</h1>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Relayer Status"
          value={relayer.online ? "Online" : "Offline"}
          accent={relayer.online ? "emerald" : "rose"}
        />
        <StatCard label="24h Relays" value={relayer.relaysToday.toString()} accent="cyan" />
        <StatCard
          label="Avg Bridge Time"
          value={`${(relayer.avgBridgeTimeMs / 1000).toFixed(0)}s`}
          accent="blue"
        />
        <StatCard
          label="Total Volume"
          value={`$${(relayer.totalVolume / 1_000_000).toFixed(2)}M`}
          accent="purple"
        />
      </div>

      {/* Relayer Card */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="mb-4 text-lg font-semibold">Relayer Details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500">Status</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  relayer.online ? "bg-emerald-400 shadow-lg shadow-emerald-400/30" : "bg-rose-400"
                }`}
              />
              <span className="text-sm text-white">{relayer.online ? "Operational" : "Down"}</span>
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500">Last Relay</span>
            <p className="mt-1 text-sm text-white">
              {Math.round((Date.now() - relayer.lastRelay) / 1000)}s ago
            </p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500">Pending TXs</span>
            <p className="mt-1 text-sm text-white">{relayer.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Liquidity Pools */}
      <h2 className="mb-4 text-lg font-semibold">Liquidity Pools</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHAIN_LIST.map((chain) => (
          <div key={chain.key} className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <span>{chain.logo}</span> {chain.name}
            </h3>
            <div className="space-y-3">
              {pools
                .filter((p) => p.chain === chain.key)
                .map((pool) => {
                  const isLow = pool.balance < pool.minThreshold;
                  return (
                    <div key={pool.token} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{pool.token}</span>
                      <div className="text-right">
                        <span className={isLow ? "text-amber-400" : "text-white"}>
                          {pool.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                        {isLow && (
                          <span className="ml-2 text-xs text-amber-400">⚠ Low</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/30 text-emerald-400",
    rose: "border-rose-500/30 text-rose-400",
    cyan: "border-cyan-500/30 text-cyan-400",
    blue: "border-blue-500/30 text-blue-400",
    purple: "border-purple-500/30 text-purple-400",
  };
  const colors = colorMap[accent] || colorMap.cyan;
  const borderColor = colors.split(" ")[0];
  const textColor = colors.split(" ")[1];

  return (
    <div className={`rounded-xl border ${borderColor} bg-gray-900/60 p-5`}>
      <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <p className={`mt-1 text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

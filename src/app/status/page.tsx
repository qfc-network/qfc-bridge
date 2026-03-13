"use client";

import { useEffect, useMemo, useState } from "react";
import { CHAIN_LIST } from "@/lib/chains";
import { getMockPoolSnapshot, getMockRelayerStatus, type PoolData, type RelayerStatusSnapshot } from "@/lib/bridge";

const RELAYER_STATUS_URL = process.env.NEXT_PUBLIC_RELAYER_STATUS_URL || "http://localhost:3295";

export default function StatusPage() {
  const [pools, setPools] = useState<PoolData[]>(getMockPoolSnapshot());
  const [relayer, setRelayer] = useState<RelayerStatusSnapshot>(getMockRelayerStatus());

  useEffect(() => {
    fetch(RELAYER_STATUS_URL)
      .then((r) => r.json())
      .then((data) => {
        setRelayer((current) => ({
          online: data.status === "ok",
          lastRelay: data.lastRelayAt || current.lastRelay,
          relaysToday: data.completedToday ?? current.relaysToday,
          avgBridgeTimeMs: data.avgBridgeTimeMs ?? current.avgBridgeTimeMs,
          totalVolume: data.totalVolume ?? current.totalVolume,
          pendingCount: data.pendingCount ?? current.pendingCount,
        }));
        if (Array.isArray(data.pools) && data.pools.length > 0) {
          setPools(data.pools);
        }
      })
      .catch(() => {
        // keep mock fallback
      });
  }, []);

  const lowLiquidityPools = useMemo(
    () => pools.filter((pool) => pool.balance < pool.minThreshold),
    [pools]
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Bridge Status</h1>
        <p className="text-sm text-gray-500">Liquidity snapshots, relayer health, and bridge throughput.</p>
      </div>

      {lowLiquidityPools.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <div className="font-medium text-amber-300">Liquidity warning</div>
          <div className="mt-1">
            {lowLiquidityPools.map((pool) => `${pool.chain.toUpperCase()} ${pool.token}`).join(", ")} below threshold.
          </div>
        </div>
      )}

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

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="mb-4 text-lg font-semibold">Relayer Details</h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <InfoItem label="Status" value={relayer.online ? "Operational" : "Down"} />
          <InfoItem label="Last Relay" value={`${Math.round((Date.now() - relayer.lastRelay) / 1000)}s ago`} />
          <InfoItem label="Pending TXs" value={relayer.pendingCount.toString()} />
          <InfoItem label="Low Pools" value={lowLiquidityPools.length.toString()} />
          <InfoItem
            label="Coverage"
            value={`${CHAIN_LIST.length} chains / ${new Set(pools.map((pool) => pool.token)).size} tokens`}
          />
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Liquidity Pools</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHAIN_LIST.map((chain) => (
          <div key={chain.key} className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <span>{chain.logo}</span> {chain.name}
            </h3>
            <div className="space-y-3">
              {pools
                .filter((pool) => pool.chain === chain.key)
                .map((pool) => {
                  const isLow = pool.balance < pool.minThreshold;
                  return (
                    <div key={pool.token} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-gray-300">{pool.token}</div>
                        <div className="text-xs text-gray-500">Min {pool.minThreshold.toLocaleString("en-US")}</div>
                      </div>
                      <div className="text-right">
                        <span className={isLow ? "text-amber-400" : "text-white"}>
                          {pool.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                        {isLow && <div className="text-xs text-amber-400">⚠ Low liquidity</div>}
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <p className="mt-1 text-sm text-white">{value}</p>
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
  const [borderColor, textColor] = colors.split(" ");

  return (
    <div className={`rounded-xl border ${borderColor} bg-gray-900/60 p-5`}>
      <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <p className={`mt-1 text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

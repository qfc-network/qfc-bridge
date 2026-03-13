"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getMockHistory, HISTORY_REFRESH_MS } from "@/lib/bridge";
import { CHAINS } from "@/lib/chains";
import { formatTimestamp, shortenTxHash, formatAmount } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/20 text-amber-400",
  Confirmed: "bg-blue-500/20 text-blue-400",
  Completed: "bg-emerald-500/20 text-emerald-400",
  Failed: "bg-rose-500/20 text-rose-400",
};

export default function HistoryPage() {
  const { isConnected, address } = useWallet();
  const [filterMine, setFilterMine] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setRefreshTick((tick) => tick + 1), HISTORY_REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const history = useMemo(() => {
    void refreshTick;
    return getMockHistory(filterMine ? address : null);
  }, [address, filterMine, refreshTick]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bridge History</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pending transfers auto-refresh every 15 seconds.
          </p>
        </div>
        {isConnected && (
          <button
            onClick={() => setFilterMine(!filterMine)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filterMine
                ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {filterMine ? "Showing My Transactions" : "Show My Transactions"}
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source TX</th>
              <th className="px-4 py-3">Target TX</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No bridge transactions found yet.
                </td>
              </tr>
            ) : (
              history.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/30">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                    {formatTimestamp(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white">
                      {CHAINS[tx.fromChain]?.logo} {CHAINS[tx.fromChain]?.name}
                    </span>
                    <span className="mx-2 text-gray-600">→</span>
                    <span className="text-white">
                      {CHAINS[tx.toChain]?.logo} {CHAINS[tx.toChain]?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-300">{tx.token}</td>
                  <td className="px-4 py-3 text-right text-white">{formatAmount(tx.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[tx.status]}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`${CHAINS[tx.fromChain]?.explorerUrl}/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      {shortenTxHash(tx.txHash)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {tx.targetTxHash ? (
                      <a
                        href={`${CHAINS[tx.toChain]?.explorerUrl}/tx/${tx.targetTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        {shortenTxHash(tx.targetTxHash)}
                      </a>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

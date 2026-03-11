"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@/context/WalletContext";
import { getMockHistory, type BridgeTx } from "@/lib/bridge";
import { CHAINS } from "@/lib/chains";
import { formatTimestamp, shortenTxHash, formatAmount } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/20 text-amber-400",
  Completed: "bg-emerald-500/20 text-emerald-400",
  Failed: "bg-rose-500/20 text-rose-400",
};

export default function HistoryPage() {
  const { isConnected } = useWallet();
  const [filterMine, setFilterMine] = useState(false);
  const history = useMemo(() => getMockHistory(), []);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bridge History</h1>
        {isConnected && (
          <button
            onClick={() => setFilterMine(!filterMine)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filterMine
                ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            My Transactions
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
              <th className="px-4 py-3">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

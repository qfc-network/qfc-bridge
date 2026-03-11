"use client";

import { CHAIN_LIST } from "@/lib/chains";

interface ChainSelectorProps {
  label: string;
  value: string;
  excludeKey?: string;
  onChange: (key: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  purple: "border-purple-500/40 hover:border-purple-500/70",
  blue: "border-blue-500/40 hover:border-blue-500/70",
  yellow: "border-yellow-500/40 hover:border-yellow-500/70",
};

export default function ChainSelector({ label, value, excludeKey, onChange }: ChainSelectorProps) {
  const chains = CHAIN_LIST.filter((c) => c.key !== excludeKey);
  const selected = CHAIN_LIST.find((c) => c.key === value);

  return (
    <div className="flex-1">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <div className="grid gap-2">
        {chains.map((chain) => (
          <button
            key={chain.key}
            onClick={() => onChange(chain.key)}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
              value === chain.key
                ? `${COLOR_MAP[chain.color] || "border-gray-600"} bg-gray-800/80`
                : "border-gray-800 bg-gray-900/40 hover:bg-gray-800/40"
            }`}
          >
            <span className="text-xl">{chain.logo}</span>
            <span className={`text-sm font-medium ${value === chain.key ? "text-white" : "text-gray-400"}`}>
              {chain.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

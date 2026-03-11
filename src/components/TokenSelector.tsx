"use client";

import { TOKENS, type TokenConfig } from "@/lib/tokens";

interface TokenSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
}

export default function TokenSelector({ value, onChange }: TokenSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
        Token
      </label>
      <div className="flex gap-2">
        {TOKENS.map((token) => (
          <button
            key={token.symbol}
            onClick={() => onChange(token.symbol)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              value === token.symbol
                ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                : "bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {token.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

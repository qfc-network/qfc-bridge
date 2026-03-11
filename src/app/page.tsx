"use client";

import { useState, useMemo } from "react";
import ChainSelector from "@/components/ChainSelector";
import TokenSelector from "@/components/TokenSelector";
import BridgeProgress, { type BridgeStep } from "@/components/BridgeProgress";
import { useWallet } from "@/context/WalletContext";
import { estimateFee, lockTokens } from "@/lib/bridge";
import { getToken } from "@/lib/tokens";
import { formatAmount } from "@/lib/format";

export default function BridgePage() {
  const { isConnected, address, provider, connect } = useWallet();
  const [sourceChain, setSourceChain] = useState("qfc");
  const [targetChain, setTargetChain] = useState("eth");
  const [tokenSymbol, setTokenSymbol] = useState("QFC");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<BridgeStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const parsedAmount = parseFloat(amount) || 0;
  const fees = useMemo(() => estimateFee(parsedAmount), [parsedAmount]);
  const token = getToken(tokenSymbol);

  const handleSwap = () => {
    setSourceChain(targetChain);
    setTargetChain(sourceChain);
  };

  const handleBridge = async () => {
    if (!provider || !address || !token || parsedAmount <= 0) return;
    setStep("locking");
    setErrorMsg("");
    try {
      await lockTokens(provider, token, amount, sourceChain, targetChain, address);
      setStep("confirming");
      // Simulate relayer confirming
      await new Promise((r) => setTimeout(r, 3000));
      setStep("releasing");
      await new Promise((r) => setTimeout(r, 2000));
      setStep("done");
    } catch (err: unknown) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Transaction rejected");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-gradient">Cross-Chain</span> Bridge
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Transfer tokens between QFC, Ethereum, and BSC networks
        </p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        {/* Chain Selectors */}
        <div className="flex items-start gap-3">
          <ChainSelector
            label="From"
            value={sourceChain}
            excludeKey={targetChain}
            onChange={setSourceChain}
          />
          <button
            onClick={handleSwap}
            className="mt-8 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-400 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
          >
            ⇄
          </button>
          <ChainSelector
            label="To"
            value={targetChain}
            excludeKey={sourceChain}
            onChange={setTargetChain}
          />
        </div>

        {/* Token Selector */}
        <div className="mt-6">
          <TokenSelector value={tokenSymbol} onChange={setTokenSymbol} />
        </div>

        {/* Amount Input */}
        <div className="mt-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
            Amount
          </label>
          <div className="flex items-center rounded-xl border border-gray-800 bg-gray-800/40 px-4 py-3">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-lg text-white outline-none placeholder:text-gray-600"
            />
            <button
              onClick={() => setAmount("1000")}
              className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30"
            >
              Max
            </button>
            <span className="ml-3 text-sm font-medium text-gray-400">{tokenSymbol}</span>
          </div>
        </div>

        {/* Fee Breakdown */}
        {parsedAmount > 0 && (
          <div className="mt-4 space-y-2 rounded-xl bg-gray-800/30 p-4 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Bridge Fee (0.1%)</span>
              <span>
                {formatAmount(fees.fee)} {tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Estimated Gas</span>
              <span>~0.002 ETH</span>
            </div>
            <div className="border-t border-gray-700 pt-2">
              <div className="flex justify-between font-medium text-white">
                <span>You Receive</span>
                <span className="text-cyan-400">
                  {formatAmount(fees.received)} {tokenSymbol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Button */}
        <div className="mt-6">
          {!isConnected ? (
            <button
              onClick={connect}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={handleBridge}
              disabled={parsedAmount <= 0 || step !== "idle"}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === "idle"
                ? parsedAmount <= 0
                  ? "Enter Amount"
                  : `Bridge ${tokenSymbol}`
                : "Bridging..."}
            </button>
          )}
        </div>

        {/* Progress Tracker */}
        <BridgeProgress
          step={step}
          sourceChain={sourceChain}
          targetChain={targetChain}
          errorMessage={errorMsg}
        />
      </div>
    </div>
  );
}

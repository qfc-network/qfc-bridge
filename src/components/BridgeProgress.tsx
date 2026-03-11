"use client";

import { CHAINS } from "@/lib/chains";

export type BridgeStep = "idle" | "locking" | "confirming" | "releasing" | "done" | "error";

interface BridgeProgressProps {
  step: BridgeStep;
  sourceChain: string;
  targetChain: string;
  errorMessage?: string;
}

const STEP_LABELS: Record<BridgeStep, (src: string, tgt: string) => string> = {
  idle: () => "",
  locking: (src) => `Locking on ${src}`,
  confirming: () => "Relayer confirming",
  releasing: (_, tgt) => `Releasing on ${tgt}`,
  done: () => "Bridge complete!",
  error: () => "Bridge failed",
};

export default function BridgeProgress({ step, sourceChain, targetChain, errorMessage }: BridgeProgressProps) {
  if (step === "idle") return null;

  const src = CHAINS[sourceChain]?.name || sourceChain;
  const tgt = CHAINS[targetChain]?.name || targetChain;
  const steps: BridgeStep[] = ["locking", "confirming", "releasing", "done"];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step === "error"
                  ? "border border-rose-500/50 bg-rose-500/20 text-rose-400"
                  : i <= currentIndex
                    ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                    : "bg-gray-800 text-gray-600"
              }`}
            >
              {step === "done" && i <= currentIndex ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 sm:w-16 ${
                  i < currentIndex ? "bg-cyan-500/40" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        {step === "error" ? (
          <p className="text-sm text-rose-400">{errorMessage || "Transaction failed"}</p>
        ) : step === "done" ? (
          <p className="text-sm font-medium text-emerald-400">
            {STEP_LABELS[step](src, tgt)}
          </p>
        ) : (
          <p className="text-sm text-gray-300">
            {STEP_LABELS[step](src, tgt)}
            <span className="animate-dot-1">.</span>
            <span className="animate-dot-2">.</span>
            <span className="animate-dot-3">.</span>
          </p>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { BiasPattern } from "../types";
import { Brain, Smile, AlertCircle, Info } from "lucide-react";
import { motion } from "motion/react";

interface BiasesProps {
  biases: BiasPattern[];
}

export default function Biases({ biases }: BiasesProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden" id="bias-detector-section">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-600/30 to-yellow-500/20 border border-amber-500/20 rounded-lg text-amber-400">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-display font-medium text-white">Subconscious Bias Indicator</h3>
          <p className="text-xs text-slate-400">Detecting mental traps and behavioral patterns affecting your choices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {biases.map((bias, idx) => {
          const isActive = bias.matchesUser;
          
          return (
            <motion.div
              key={bias.biasType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border rounded-xl p-4 transition-all duration-300 relative ${
                isActive
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-white/10 bg-[#0A0B10]/40 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-display font-semibold text-white">
                  {bias.biasType}
                </h4>
                {isActive ? (
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    ACTIVE ({bias.intensity}/10)
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400">
                    SLIGHT ({bias.intensity}/10)
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed min-h-[60px]">
                {bias.explanation}
              </p>

              {isActive && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-start gap-1.5 text-[10px] text-amber-300/90 leading-normal">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    <strong>Antidote:</strong> Distinguish hypothetical downside from permanent damage. Run safe experiments.
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

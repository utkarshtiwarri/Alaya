import React from "react";
import { OptionComparison } from "../types";
import { Scale, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";

interface TradeoffsProps {
  options: OptionComparison[];
}

export default function Tradeoffs({ options }: TradeoffsProps) {
  if (options.length === 0) return null;

  // We support comparing 2 options. If there are more, we render side-by-side cards.
  const criteriaKeys = [
    { key: "risk" as const, label: "Risk Intensity", description: "Lower score represents lower volatility" },
    { key: "growth" as const, label: "Career Growth", description: "Upward trajectory potential" },
    { key: "income" as const, label: "Financial Income", description: "Short to medium term cash flow stability" },
    { key: "learning" as const, label: "Skill & Learning", description: "Compound learning velocity" },
    { key: "flexibility" as const, label: "Life Flexibility", description: "Personal schedule sovereignty" },
  ];

  const colors = [
    "from-blue-500 to-purple-500 shadow-blue-900/40",
    "from-purple-500 to-indigo-500 shadow-purple-900/40",
    "from-cyan-500 to-blue-500 shadow-cyan-900/40",
  ];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden" id="tradeoff-analyzer-section">
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-600/30 to-purple-500/20 border border-indigo-500/20 rounded-lg text-indigo-400">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-display font-medium text-white">Tradeoff Analyzer</h3>
          <p className="text-xs text-slate-400">Core decision criteria scored side-by-side (1-10 intensity scale)</p>
        </div>
      </div>

      {/* Side-by-Side Horizontal Comparisons */}
      <div className="space-y-4">
        {criteriaKeys.map((crit, cIdx) => (
          <div key={crit.key} className="bg-[#0A0B10]/40 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <span className="text-sm font-semibold text-slate-200">{crit.label}</span>
                <span className="text-[10px] text-slate-500 ml-2">({crit.description})</span>
              </div>
            </div>

            <div className="space-y-3">
              {options.map((option, oIdx) => {
                const value = option.criteria[crit.key];
                const activeColor = colors[oIdx % colors.length];
                return (
                  <div key={option.optionName} className="grid grid-cols-12 gap-3 items-center">
                    {/* Option Brand Indicator */}
                    <div className="col-span-12 md:col-span-3 text-xs font-medium text-slate-300 truncate font-display">
                      {option.optionName}
                    </div>
                    {/* Progress Bar */}
                    <div className="col-span-10 md:col-span-8 h-2.5 bg-[#0A0B10] border border-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 10}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${activeColor} rounded-full`}
                      />
                    </div>
                    {/* Progress value */}
                    <div className="col-span-2 md:col-span-1 text-right text-xs font-mono font-bold text-slate-100">
                      {value}/10
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pros & Cons Matrix */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option, oIdx) => {
          const accentColorClass = oIdx === 0 ? "border-purple-500/20" : "border-cyan-500/20";
          const headerBg = oIdx === 0 ? "bg-purple-500/5 text-purple-300" : "bg-cyan-500/5 text-cyan-300";

          return (
            <div key={option.optionName} className={`border border-white/10 rounded-xl bg-[#0A0B10]/40 overflow-hidden`}>
              <div className={`px-4 py-3 font-display font-medium text-sm border-b border-white/10 ${headerBg}`}>
                {option.optionName} Analytical Ledger
              </div>
              <div className="p-4 space-y-4">
                {/* Pros list */}
                <div>
                  <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Key Plusses
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-300">
                    {option.pros.map((p, pIdx) => (
                      <li key={pIdx}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Cons list */}
                <div>
                  <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> Key Risks / Tradeoffs
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-300">
                    {option.cons.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

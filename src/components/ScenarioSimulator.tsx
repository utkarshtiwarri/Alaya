import React, { useState } from "react";
import { FutureScenario } from "../types";
import { Hourglass, ArrowUpRight, ShieldX, HelpCircle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScenarioSimulatorProps {
  scenarios: FutureScenario[];
}

export default function ScenarioSimulator({ scenarios }: ScenarioSimulatorProps) {
  if (scenarios.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden" id="timeline-simulation-section">
      <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600/30 to-indigo-500/20 border border-purple-500/20 rounded-lg text-purple-400">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-medium text-white">1-Year Future Scenario Simulation</h3>
            <p className="text-xs text-slate-400">Time-travel projection models based on behavioral paths</p>
          </div>
        </div>

        {/* Option Select Tabs */}
        <div className="flex bg-[#0A0B10]/80 border border-white/10 rounded-lg p-1 shrink-0 self-start md:self-auto">
          {scenarios.map((sc, scIdx) => (
            <button
              key={sc.optionName}
              onClick={() => setActiveIndex(scIdx)}
              className={`px-4 py-1.5 rounded-md text-xs font-display font-medium transition-all ${
                activeIndex === scIdx
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sc.optionName}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Main Simulation Projection */}
          <div className="lg:col-span-6 bg-[#0A0B10]/40 border border-white/10 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-purple-400/80 bg-purple-950/30 px-2 py-0.5 border border-purple-500/20 rounded">
              <Activity className="w-3 h-3 animate-pulse" /> +365 Days Projection
            </div>

            <div className="space-y-3 mt-4">
              <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">The Timeline Narrative</span>
              <p className="text-sm text-slate-200 leading-relaxed font-sans mt-1">
                {scenarios[activeIndex].oneYearOutcome.description}
              </p>
            </div>

            <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-400 italic">
              "Every action today sends ripples into tomorrow. Commitment unlocks this path."
            </div>
          </div>

          {/* Advantages, Challenges, Risks */}
          <div className="lg:col-span-6 space-y-4">
            {/* Pluses */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase mb-2">
                <ArrowUpRight className="w-4 h-4" /> Potential Upsides & Rewards
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-5">
                {scenarios[activeIndex].oneYearOutcome.advantages.map((adv, aIdx) => (
                  <li key={aIdx}>{adv}</li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-amber-400 uppercase mb-2">
                <HelpCircle className="w-4 h-4" /> Day-To-Day Friction / Challenges
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-5">
                {scenarios[activeIndex].oneYearOutcome.challenges.map((chal, cIdx) => (
                  <li key={cIdx}>{chal}</li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-rose-400 uppercase mb-2">
                <ShieldX className="w-4 h-4" /> Systemic / Catastrophic Risks
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-5">
                {scenarios[activeIndex].oneYearOutcome.risks.map((r, rIdx) => (
                  <li key={rIdx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

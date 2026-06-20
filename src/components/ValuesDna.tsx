import React from "react";
import { CoreValue, DecisionStyle, HiddenBlocker } from "../types";
import { ShieldAlert, Award, Compass, Zap, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface ValuesDnaProps {
  coreValues: CoreValue[];
  style: DecisionStyle;
  blockers: HiddenBlocker[];
  confidence: number;
}

export default function ValuesDna({ coreValues, style, blockers, confidence }: ValuesDnaProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="values-dna-section">
      {/* Mapped Core Values */}
      <div className="lg:col-span-6 bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-gradient-to-br from-purple-600/30 to-blue-500/20 border border-purple-500/20 rounded-lg text-purple-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-medium text-white">Mapped Core Values</h3>
            <p className="text-xs text-slate-400">Subconscious priorities driving your decision alignment</p>
          </div>
        </div>

        <div className="space-y-4">
          {coreValues.map((val, idx) => (
            <motion.div
              key={val.value}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-200">{val.value}</span>
                <span className="font-mono text-purple-400 text-xs font-semibold">
                  Importance: {val.importance}/10
                </span>
              </div>
              <div className="h-2 bg-[#0A0B10] border border-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val.importance * 10}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 pl-1 italic">
                {val.explanation}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decision Style & Confidence */}
      <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
        {/* Cognitive Decision Style */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600/30 to-purple-500/20 border border-blue-500/20 rounded-lg text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-medium text-white">Decision-Making Style</h3>
              <p className="text-xs text-slate-400">Your cognitive approach to complex choices</p>
            </div>
          </div>

          <div className="bg-[#0A0B10]/40 border border-white/10 rounded-xl p-4 mt-2">
            <div className="text-indigo-300 font-display font-semibold text-base mb-1">
              {style.style}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {style.description}
            </p>
          </div>

          {/* Subconscious Blockers */}
          <div className="mt-5 space-y-3">
            <div className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Subconscious Blockages
            </div>
            <div className="grid grid-cols-1 gap-2">
              {blockers.map((block) => (
                <div key={block.blocker} className="bg-rose-950/10 border border-rose-900/20 rounded-lg p-2.5 flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {block.blocker} <span className="text-rose-400 font-mono text-[10px] ml-1">({block.intensity}/10 intensity)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{block.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">DNA Alignment Score</span>
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-[10px] text-slate-300 rounded border border-slate-800 hidden group-hover:block z-10 font-normal">
                    Reflects the degree of cohesion between your stated values, fears, and action plans.
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-display font-medium text-white">Confidence Level</h4>
              <p className="text-xs text-slate-400">
                A high score implies low values-cognitive friction. Some friction is normal!
              </p>
            </div>

            <div className="relative shrink-0 flex items-center justify-center">
              {/* SVG Ring Gauge */}
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#1e293b" fill="transparent" />
                <motion.circle
                  initial={{ strokeDasharray: "201", strokeDashoffset: "201" }}
                  animate={{ strokeDashoffset: 201 - (201 * confidence) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="40"
                  cy="40"
                  r="32"
                  strokeWidth="6"
                  stroke="url(#gradient-cyan)"
                  fill="transparent"
                  strokeDasharray="201"
                />
                <defs>
                  <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-bold font-mono text-white">{confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { ShieldAlert, User, Star } from "lucide-react";

export default function ResponsibleAIModal() {
  return (
    <div className="bg-[#0A0B10]/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden" id="responsible-ai-section">
      <div className="absolute top-0 left-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl" />
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-display font-semibold text-white">Responsible AI Commitment & Disclaimer</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Alaya is designed as an analytical lens, not an automated oracle. Sound choices require human context, gut feelings, and subjective constraints.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-400">
            <div className="flex gap-1.5 items-center">
              <Star className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Provides insights & tradeoffs</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>You retain absolute command</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Never makes choices for you</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

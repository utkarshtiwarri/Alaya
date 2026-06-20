import React, { useState, useEffect } from "react";
import { SuggestedActionPath } from "../types";
import { ListChecks, Calendar, Rocket, ClipboardList, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface ActionProtocolProps {
  actionPath: SuggestedActionPath;
}

export default function ActionProtocol({ actionPath }: ActionProtocolProps) {
  const { summary, actionProtocol, validationExperiment } = actionPath;

  // Let's implement active interactive checkboxes that user can click to "commit"
  const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<"days7" | "days14" | "days30">("days7");

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alaya_completed_actions");
      if (saved) {
        setCompletedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }
  }, []);

  const toggleItem = (key: string) => {
    const newVal = !completedItems[key];
    const updated = { ...completedItems, [key]: newVal };
    setCompletedItems(updated);
    try {
      localStorage.setItem("alaya_completed_actions", JSON.stringify(updated));
    } catch (e) {}
  };

  const currentActions =
    activeTab === "days7"
      ? actionProtocol.days7
      : activeTab === "days14"
      ? actionProtocol.days14
      : actionProtocol.days30;

  const getCompletionPercentage = (listName: "days7" | "days14" | "days30", items: string[]) => {
    if (items.length === 0) return 0;
    const completed = items.filter((it) => completedItems[`${listName}_${it}`]).length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden" id="action-protocol-section">
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gradient-to-br from-cyan-600/30 to-blue-500/20 border border-cyan-500/20 rounded-lg text-cyan-400">
          <ListChecks className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-display font-medium text-white">Action Protocol & Validation Plan</h3>
          <p className="text-xs text-slate-400">The core experiment. Test hypothetical choices in safe, micro-doses.</p>
        </div>
      </div>

      {/* Narrative Header */}
      <div className="bg-[#0A0B10]/60 border border-white/10 rounded-xl p-4 mb-6 text-sm text-cyan-255 leading-relaxed font-sans">
        <strong className="text-cyan-400">The Strategic Approach:</strong> <span className="text-slate-200">{summary}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Playbook Interactive Checklists */}
        <div className="lg:col-span-7 bg-[#0A0B10]/40 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" /> Interactive Playbooks
            </span>
            {/* Completion indicator */}
            <span className="text-xs font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded">
              Progress: {getCompletionPercentage(activeTab, currentActions)}%
            </span>
          </div>

          <div className="flex border border-white/10 rounded-lg p-1 bg-[#0A0B10] mb-4 text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveTab("days7")}
              className={`flex-1 py-1.5 rounded transition-all font-display ${
                activeTab === "days7"
                  ? "bg-white/10 text-white font-bold"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              7-Day Playbook
            </button>
            <button
              onClick={() => setActiveTab("days14")}
              className={`flex-1 py-1.5 rounded transition-all font-display ${
                activeTab === "days14"
                  ? "bg-white/10 text-white font-bold"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              14-Day Playbook
            </button>
            <button
              onClick={() => setActiveTab("days30")}
              className={`flex-1 py-1.5 rounded transition-all font-display ${
                activeTab === "days30"
                  ? "bg-white/10 text-white font-bold"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              30-Day Playbook
            </button>
          </div>

          {/* Action List items with interactive checkboxes */}
          <div className="space-y-2">
            {currentActions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No playbooks configured for this period.</p>
            ) : (
              currentActions.map((act) => {
                const itemKey = `${activeTab}_${act}`;
                const checked = !!completedItems[itemKey];

                return (
                  <label
                    key={act}
                    onClick={() => toggleItem(itemKey)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                      checked
                        ? "border-cyan-500/20 bg-cyan-500/5 opacity-80"
                        : "border-white/10 bg-[#0A0B10]/30 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div
                      className={`h-4.5 w-4.5 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                        checked
                          ? "bg-cyan-500 border-cyan-400 text-slate-950"
                          : "border-white/20 bg-[#0A0B10]"
                      }`}
                    >
                      {checked && <CheckCircle className="w-4 h-4 text-slate-950 fill-white stroke-cyan-500" />}
                    </div>
                    <span className={`text-xs leading-normal font-medium ${checked ? "text-slate-400 line-through" : "text-slate-200"}`}>
                      {act}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Action Lab / Experiment Blueprint */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-xl p-5">
          <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3">
            <Rocket className="w-4 h-4 text-cyan-400" /> Validation Experiment
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-widest">
                Objective
              </span>
              <p className="text-xs text-slate-200 mt-1 font-medium bg-[#0A0B10]/60 p-2.5 rounded border border-white/5">
                {validationExperiment.objective}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-widest">
                  Target Timeline
                </span>
                <p className="text-xs text-cyan-300 mt-0.5 font-bold font-mono">
                  {validationExperiment.timeline}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-widest mb-1.5">
                Key Metrics to Measure Interest
              </span>
              <div className="flex flex-wrap gap-1.5">
                {validationExperiment.keyMetrics.map((met) => (
                  <span
                    key={met}
                    className="px-2 py-0.5 rounded text-[10px] font-medium font-mono bg-cyan-950/40 text-cyan-200 border border-cyan-500/10"
                  >
                    {met}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-widest mb-2">
                Action Steps Blueprint
              </span>
              <div className="space-y-2">
                {validationExperiment.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-2.5 items-start">
                    <span className="h-4.5 w-4.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] font-bold font-mono text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-normal">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

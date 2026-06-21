/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Logo from "./components/Logo";
import ValuesDna from "./components/ValuesDna";
import Tradeoffs from "./components/Tradeoffs";
import Biases from "./components/Biases";
import ScenarioSimulator from "./components/ScenarioSimulator";
import ActionProtocol from "./components/ActionProtocol";
import ResponsibleAIModal from "./components/ResponsibleAIModal";
import {
  AlayaReport,
  FollowUpQuestion,
  SurveyAnswers,
  CoreValue,
  OptionComparison,
  BiasPattern,
} from "./types";
import {
  Brain,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Compass,
  FileText,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const DEMONSTRATION_DILEMMAS = [
  {
    title: "GATE vs Job Placement",
    tagline: "Academic Depth vs Corporate Security",
    text: "I can't decide whether to prepare full-time for the GATE exam to pursue a research M.Tech, or accept a standard campus placement offer at a stable software firm.",
  },
  {
    title: "Startup vs Corporate",
    tagline: "High Volatility vs Corporate Career",
    text: "My friends are building an early-stage fintech startup and want me as a technical co-founder, but I also have a well-paying placement offer in a prestigious multi-national company.",
  },
  {
    title: "Higher Studies vs Work Stability",
    tagline: "Overseas Expansion vs Current Growth",
    text: "I'm torn between moving to Europe for an MS in software systems or staying in my stable, senior engineer position here with a clear path to management.",
  },
  {
    title: "Career Transition",
    tagline: "Passion Alignment vs Domain Expert Comfort",
    text: "I am a mechanical design engineer wanting to pivot into artificial intelligence. However, leaving my stable 5-year career feels risky with my family dependencies.",
  },
];

const localMockQuestions = (dilemma: string): FollowUpQuestion[] => [
  {
    id: "q1",
    question: `Which outcome matters more to you in this dilemma: growth, stability, or learning?`,
    category: "values",
    suggestedOptions: ["Growth", "Stability", "Learning", "Not sure / custom"],
  },
  {
    id: "q2",
    question: `What is your biggest unspoken fear about this choice?`,
    category: "fears",
    suggestedOptions: ["Failing", "Letting people down", "Missing opportunities", "Other / custom"],
  },
  {
    id: "q3",
    question: `Which constraint matters most right now? (time, money, location)`,
    category: "context",
    suggestedOptions: ["Time", "Money", "Location", "Other / custom"],
  },
];

const localMockReport = (dilemma: string, answers: SurveyAnswers): AlayaReport => ({
  coreValues: [
    { value: "Growth", explanation: "You value continuous learning and challenge.", importance: 9 },
    { value: "Security", explanation: "You care about stable income and predictability.", importance: 7 },
  ],
  decisionStyle: { style: "Analytical Dreamer", description: "Balances data with long-term vision." },
  hiddenBlockers: [
    { blocker: "Fear of failure", description: "Worries about disappointing others.", intensity: 6 },
  ],
  optionsCompared: [
    {
      optionName: "Option A",
      criteria: { risk: 6, growth: 9, income: 5, learning: 9, flexibility: 6 },
      pros: ["High learning", "Exciting"],
      cons: ["Uncertain income", "Long hours"],
    },
    {
      optionName: "Option B",
      criteria: { risk: 3, growth: 5, income: 8, learning: 4, flexibility: 7 },
      pros: ["Stable income", "Predictable schedule"],
      cons: ["Less rapid growth", "Less creative control"],
    },
  ],
  biasAnalysis: [
    { biasType: "Loss Aversion", matchesUser: true, intensity: 6, explanation: "Overweights potential losses compared to gains." },
  ],
  futureScenarios: [
    {
      optionName: "Option A",
      oneYearOutcome: {
        description: "Steep learning curve with project wins.",
        advantages: ["Skills growth"],
        challenges: ["Burnout risk"],
        risks: ["Income drops"],
      },
    },
    {
      optionName: "Option B",
      oneYearOutcome: {
        description: "Consistent progress and stable earnings.",
        advantages: ["Financial stability"],
        challenges: ["Slower growth"],
        risks: ["Regret over missed opportunities"],
      },
    },
  ],
  suggestedActionPath: {
    summary: "Run a two-week validation experiment focusing on high-impact tests.",
    actionProtocol: { days7: ["List measurable outcomes", "Speak to one mentor"], days14: ["Run short trial", "Measure metrics"], days30: ["Review results", "Decide next step"] },
    validationExperiment: { objective: "Test option viability", timeline: "14 days", keyMetrics: ["Time spent", "Progress made"], steps: ["Prototype", "User feedback"] },
  },
  confidenceLevel: 72,
});

const isHardError = (message: string) => {
  return /quota|limit|exceeded|gemini_api_key|api key/i.test(message);
};

const shouldUseLocalMock = (message: string) => {
  return /page could not be found|not found|unexpected response format|networkerror|failed to fetch|network request failed|failed to generate|failed to run|failed during|invalid response|internal server error|service unavailable|bad gateway|gateway timeout|not_found/i.test(message);
};

export default function App() {
  const [page, setPage] = useState<"landing" | "analyze" | "results" | "about">("landing");
  
  // Analysis Inputs & States
  const [dilemma, setDilemma] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [customAnswer, setCustomAnswer] = useState("");
  
  // Report Generation States
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<AlayaReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load report from localStorage on mount (persistence)
  useEffect(() => {
    try {
      const savedReport = localStorage.getItem("alaya_current_report");
      const savedDilemma = localStorage.getItem("alaya_current_dilemma");
      if (savedReport) {
        setReport(JSON.parse(savedReport));
        if (savedDilemma) setDilemma(savedDilemma);
        setPage("results");
      }
    } catch (e) {
      console.error("Local storage load failed", e);
    }
  }, []);

  // Quick select dynamic examples
  const applyDemoDilemma = (text: string) => {
    setDilemma(text);
    setPage("analyze");
  };

  const parseApiResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    const text = await res.text();
    return { error: text || "Unexpected response format from server" };
  };

  // 1. Generate questions
  const fetchQuestions = async () => {
    if (!dilemma.trim()) return;
    setLoadingQuestions(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dilemma }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate personalized questions");
      }

      if (!data || !Array.isArray(data.questions)) {
        throw new Error("Invalid response from the server while generating questions.");
      }

      setQuestions(data.questions);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setCustomAnswer("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (isHardError(message)) {
        setError(message || "Daily AI limit exceeded or API key configuration error.");
      } else if (shouldUseLocalMock(message)) {
        const fallbackQuestions = localMockQuestions(dilemma);
        setQuestions(fallbackQuestions);
        setCurrentQuestionIdx(0);
        setAnswers({});
        setCustomAnswer("");
        setError("The API was unavailable, so Alaya is running in local demo mode.");
      } else {
        setError(message || "Something went wrong. Let's try again.");
      }
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 2. Add answer and proceed
  const saveAnswerAndProceed = (answerText: string) => {
    if (questions.length === 0 || !questions[currentQuestionIdx]) {
      return;
    }

    const qId = questions[currentQuestionIdx].id;
    const updatedAnswers = { ...answers, [qId]: answerText };
    setAnswers(updatedAnswers);
    setCustomAnswer("");

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      generateFinalReport(updatedAnswers);
    }
  };

  // 3. Generate final report
  const generateFinalReport = async (finalAnswers: SurveyAnswers) => {
    // reset response state if making a new live request
    setGeneratingReport(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dilemma, answers: finalAnswers }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to run decision synthesis");
      }

      if (!data || !data.report) {
        throw new Error("Invalid response received from the engine.");
      }

      setReport(data.report);
      localStorage.setItem("alaya_current_report", JSON.stringify(data.report));
      localStorage.setItem("alaya_current_dilemma", dilemma);
      setPage("results");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (isHardError(message)) {
        setError(message || "Daily AI limit exceeded or API key configuration error.");
      } else if (shouldUseLocalMock(message)) {
        const fallbackReport = localMockReport(dilemma, finalAnswers);
        setReport(fallbackReport);
        localStorage.setItem("alaya_current_report", JSON.stringify(fallbackReport));
        localStorage.setItem("alaya_current_dilemma", dilemma);
        setPage("results");
        setError("The API was unavailable, so Alaya is running in local demo mode.");
      } else {
        setError(message || "Failed during report synthesis");
      }
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("alaya_current_report");
    localStorage.removeItem("alaya_current_dilemma");
    localStorage.removeItem("alaya_completed_actions");
    setReport(null);
    setDilemma("");
    setAnswers({});
    setQuestions([]);
    setPage("landing");
  };

  const handleExportText = () => {
    if (!report) return;
    const content = `
ALAYA REPORT
YOUR AI THINKING PARTNER FOR LIFE'S BIGGEST DECISIONS

Dilemma: "${dilemma}"

Core Values Mapping:
${report.coreValues.map((v: CoreValue) => `- ${v.value}: ${v.explanation} (Importance: ${v.importance}/10)`).join("\n")}

Decision Style:
Style: ${report.decisionStyle.style}
Explanation: ${report.decisionStyle.description}

Confidence Index: ${report.confidenceLevel}%

Option Criteria Scoring:
${report.optionsCompared
  .map(
    (opt: OptionComparison) =>
      `Option: ${opt.optionName}
 - Risk: ${opt.criteria.risk}/10
 - Growth: ${opt.criteria.growth}/10
 - Income: ${opt.criteria.income}/10
 - Learning: ${opt.criteria.learning}/10
 - Flexibility: ${opt.criteria.flexibility}/10
 Pros: ${opt.pros.join(", ")}
 Cons: ${opt.cons.join(", ")}`
  )
  .join("\n\n")}

Cognitive Biases Manifesting:
${report.biasAnalysis.map((b: BiasPattern) => `- ${b.biasType}: ${b.explanation}`).join("\n")}

Strategic suggested pathway: ${report.suggestedActionPath.summary}

7-Day Playbook:
${report.suggestedActionPath.actionProtocol.days7.map((item: string) => `- ${item}`).join("\n")}

14-Day Playbook:
${report.suggestedActionPath.actionProtocol.days14.map((item: string) => `- ${item}`).join("\n")}

30-Day Playbook:
${report.suggestedActionPath.actionProtocol.days30.map((item: string) => `- ${item}`).join("\n")}

Validation Experiment objective: ${report.suggestedActionPath.validationExperiment.objective}
Target metrics: ${report.suggestedActionPath.validationExperiment.keyMetrics.join(", ")}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Alaya_Clarity_Blueprint.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100 selection:bg-purple-600/30 font-sans pb-16">
      {/* Absolute glow points */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header element */}
      <header className="border-b border-white/5 bg-[#0A0B10]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage("landing")}>
            <Logo className="w-9 h-9" />
            <div>
              <span className="text-lg font-display font-medium tracking-tight text-white flex items-center gap-1.5">
                ALAYA
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-purple-400 block -mt-1">
                Thinking Partner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-5">
              <button
                onClick={() => setPage("landing")}
                className={`text-xs font-display font-medium transition-colors ${
                  page === "landing" ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Overview
              </button>
            <button
              onClick={() => {
                if (report) {
                  setPage("results");
                } else {
                  setPage("analyze");
                }
              }}
              className={`text-xs font-display font-medium transition-colors ${
                page === "analyze" || page === "results"
                  ? "text-purple-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {report ? "DNA Report" : "Start Analysis"}
            </button>
            <button
              onClick={() => setPage("about")}
              className={`text-xs font-display font-medium transition-colors ${
                page === "about" ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Philosophy
            </button>
          </nav>
        </div>
      </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <AnimatePresence mode="wait">
          
          {/* LANDING PAGE */}
          {page === "landing" && (
            <motion.div
              key="landing-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* HERO SECTION */}
              <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-semibold text-purple-300 tracking-wider uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Empowering Hard Compromises
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight leading-tight">
                  Your AI Thinking Partner for{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent italic">
                    Life's Biggest Decisions
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
                  Alaya doesn't make decisions for you. Instead, we map your subconscious values, uncover cognitive biases, simulate future timelines, and deliver safe micro-experiments to help you move from confusion to clear action.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setPage("analyze")}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                  >
                    Start Analysis <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage("about")}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl font-display font-semibold text-sm bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Read Our Philosophy <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MISSION ROADMAP */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto relative glow-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
                  <div className="space-y-2">
                    <div className="text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">01. Confusion</div>
                    <p className="text-xs text-slate-400">Paralyzed by competing priorities, fear, or external feedback.</p>
                  </div>
                  <div className="text-slate-600 text-xl font-mono hidden md:block">↓</div>
                  <div className="space-y-2">
                    <div className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">02. Clarity</div>
                    <p className="text-xs text-slate-300">Understand your core values, biases, and day-to-day tradeoffs.</p>
                  </div>
                  <div className="text-slate-600 text-xl font-mono hidden md:block">↓</div>
                  <div className="space-y-2">
                    <div className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">03. Action</div>
                    <p className="text-xs text-slate-400">Launch a 14-day trial experiment to validate options risk-free.</p>
                  </div>
                </div>
              </div>

              {/* COMMON DILEMMAS & TEMPLATES */}
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h3 className="text-xl font-display font-medium text-white">Choose a Common Dilemma</h3>
                  <p className="text-xs text-slate-400">Click a scenario template below to immediately test the framework</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                  {DEMONSTRATION_DILEMMAS.map((item) => (
                    <div
                      key={item.title}
                      onClick={() => applyDemoDilemma(item.text)}
                      className="group bg-white/[0.03] border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 cursor-pointer hover:bg-white/[0.07] transition-all duration-300 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors font-display">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                            Template
                          </span>
                        </div>
                        <p className="text-[10px] text-purple-400 font-mono tracking-wide uppercase">
                          {item.tagline}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium pt-2 group-hover:translate-x-1 transition-transform">
                        Explore This Lens <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PERSISTENT DISCLOSURE WARNING */}
              <div className="max-w-4xl mx-auto pt-6">
                <ResponsibleAIModal />
              </div>
            </motion.div>
          )}

          {/* ACTIVE DECISION INPUT & QUESTIONS FLOW */}
          {page === "analyze" && (
            <motion.div
              key="analyze-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {questions.length === 0 ? (
                /* Dilemma Submission Input Form */
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-display font-medium text-white">Define Your Dilemma</h2>
                    <p className="text-xs text-slate-400">
                      Express the core dilemma you are navigating. The more honest context, the better.
                    </p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Your Dilemma Statement
                      </label>
                      <textarea
                        value={dilemma}
                        onChange={(e: Event) => setDilemma((e.target as HTMLTextAreaElement).value)}
                        placeholder="E.g., I'm stuck between moving overseas for a software job representing growth of 30%, or preparing locally for a highly competitive research post because I love deep theory..."
                        rows={5}
                        className="w-full bg-[#0A0B10]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/80 placeholder-slate-600 transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="flex bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 items-start gap-2.5 text-xs text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      onClick={fetchQuestions}
                      disabled={loadingQuestions || !dilemma.trim()}
                      className="w-full py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-purple-950"
                    >
                      {loadingQuestions ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Map Cognitive Variables...
                        </>
                      ) : (
                        <>
                          Begin Thinking Session <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <ResponsibleAIModal />
                </div>
              ) : generatingReport ? (
                /* Generating Report Load state */
                <div className="py-16 text-center space-y-8 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border border-purple-500/20 border-t-purple-500 animate-spin" />
                    <Compass className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>

                  <div className="space-y-3 max-w-md">
                    <h3 className="text-xl font-display font-medium text-white">Synthesizing Your Decision DNA...</h3>
                    <p className="text-xs text-slate-400 font-mono animate-pulse">
                      Analyzing values, discovering underlying biases, projection timeline simulation...
                    </p>
                    <div className="bg-slate-950/50 p-3.5 border border-slate-900 rounded-xl text-[11px] text-slate-400 italic font-sans">
                      "Alaya does not make decisions for you. We frame variables side-by-side so you can act with absolute confidence."
                    </div>
                  </div>
                </div>
              ) : (
                /* DIALOGUE QUESTIONNAIRE */
                <div className="space-y-6">
                  {/* Progress Line */}
                  <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                    <span className="font-bold text-purple-400 uppercase tracking-widest">Diagnostic Phase</span>
                    <span>
                      Question {currentQuestionIdx + 1} of {questions.length}
                    </span>
                  </div>

                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                    />
                  </div>

                  {/* Question Box */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6 relative overflow-hidden">
                    <h3 className="text-lg font-display font-medium text-white leading-relaxed">
                      {questions[currentQuestionIdx].question}
                    </h3>

                    {/* Multiple-choice selector list */}
                    <div className="space-y-2.5">
                      {questions[currentQuestionIdx].suggestedOptions.map((opt) => (
                        <button
                           key={opt}
                          onClick={() => saveAnswerAndProceed(opt)}
                          className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-[#0A0B10]/40 hover:bg-white/5 hover:border-purple-500/40 hover:text-white text-xs text-slate-300 transition-all font-medium leading-relaxed"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* Custom Text Area in case user wants to specify self details */}
                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                        Or provide custom context / answer:
                      </span>
                      <textarea
                        value={customAnswer}
                        onChange={(e: Event) => setCustomAnswer((e.target as HTMLTextAreaElement).value)}
                        placeholder="Write your custom notes, metrics, or personal situation here..."
                        rows={3}
                        className="w-full bg-[#0A0B10]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500/80 transition-colors"
                      />
                      <div className="flex justify-end gap-3 pt-1">
                        <button
                          onClick={() => saveAnswerAndProceed("Skipped question or did not specify")}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => {
                            if (customAnswer.trim()) {
                              saveAnswerAndProceed(customAnswer);
                            }
                          }}
                          disabled={!customAnswer.trim()}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
                        >
                          Apply Answer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* CLARITY RESULTS DASHBOARD REPORT */}
          {page === "results" && report && (
            <motion.div
              key="results-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Report Header Block */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-bold">
                    System Synthesis Active
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-white">Your Decision DNA Blueprint</h2>
                  <p className="text-xs text-slate-400">
                    <strong>Navigating Compromise:</strong> "{dilemma}"
                  </p>
                </div>

                {/* Dashboard Options */}
                <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                  <button
                    onClick={handleExportText}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[#0A0B10]/40 hover:bg-white/5 border border-white/10 text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Report
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/10 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Start Over
                  </button>
                </div>
              </div>

              {/* Grid 1: Values DNA & Confidence Score (Feature 1) */}
              <ValuesDna
                coreValues={report.coreValues}
                style={report.decisionStyle}
                blockers={report.hiddenBlockers}
                confidence={report.confidenceLevel}
              />

              {/* Grid 2: Tradeoff Area (Feature 2) */}
              <Tradeoffs options={report.optionsCompared} />

              {/* Grid 3: Bias Detector Card Deck (Feature 3) */}
              <Biases biases={report.biasAnalysis} />

              {/* Grid 4: Projection timelines (Feature 4) */}
              <ScenarioSimulator scenarios={report.futureScenarios} />

              {/* Grid 5: Action Protocol Plan playbooks & checkpoints (Feature 5) */}
              <ActionProtocol actionPath={report.suggestedActionPath} />

              {/* Responsible AI persistence card */}
              <ResponsibleAIModal />
            </motion.div>
          )}

          {/* ABOUT & PHILOSOPHY COGNITIVE GUIDE */}
          {page === "about" && (
            <motion.div
              key="about-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="text-center space-y-3 pt-6">
                <h2 className="text-3xl font-display font-medium text-white tracking-tight">Our Philosophy & Approach</h2>
                <p className="text-sm text-purple-400 font-mono tracking-widest uppercase font-bold">
                  Confusion → Clarity → Action
                </p>
              </div>

              {/* Column Layout */}
              <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-display font-semibold text-white">The Mental Block: Why We Get Stuck</h3>
                  <p>
                    Traditional advice engines tell you what to choose. "Choose corporate stability." "Prepare for GATE." This is highly comforting but creates immediate biological bias and friction. It fails to match your organic values or unexpressed fears.
                  </p>
                  <p>
                    By framing compromises side-by-side and examining underlying bottlenecks (fear of failure, sunk costs, or parental pressure), Alaya resolves friction. This empowers you, returning complete control to your hands.
                  </p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-display font-semibold text-white">The Human in the Loop Framework</h3>
                  <p>
                    We reject automated decisions. Critical pathways demand human intuition, gut feeling, and subjective evaluation.
                  </p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      <strong>Introspective Questions:</strong> Dynamic queries ensure your constraints form the report's foundation.
                    </li>
                    <li>
                      <strong>Timelines Simulator:</strong> Explore candidate lives 1 year later without any catastrophic permanence.
                    </li>
                    <li>
                      <strong>Validation Experiments:</strong> Rather than forcing hard immediate commitments, we create 14-day micro-tests to gather actual real-world validation.
                    </li>
                  </ul>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-display font-semibold text-white">Responsible AI Commitment</h3>
                  <p>
                    Alaya relies strictly on the structured, advanced analytical capabilities of modern Gemini. We enforce clear parameters ensuring this software remains a safe advisor, avoiding deterministic answers.
                  </p>
                  <p>
                    Every analysis highlights tradeoff indexes and risks, reminding the user that choices represent learning loops.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setPage("analyze")}
                  className="px-6 py-3 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-purple-900/20"
                >
                  Start Your Analysis Session <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Status Bar */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-6 text-[10px] font-medium tracking-wider text-slate-500">
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> ENGINE: NEURAL_THINKER_v9</div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> SIMULATION: STOCHASTIC_LIFEPATH</div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono">
          &copy; 2026 ALAYA SYSTEMS • ALL DECISIONS RESERVED
        </div>
      </footer>
    </div>
  );
}

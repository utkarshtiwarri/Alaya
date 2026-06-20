/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CoreValue {
  value: string;
  explanation: string;
  importance: number; // 1-10 scale
}

export interface DecisionStyle {
  style: string;
  description: string;
}

export interface HiddenBlocker {
  blocker: string;
  description: string;
  intensity: number; // 1-10 scale
}

export interface OptionCriteria {
  risk: number; // 1-10
  growth: number; // 1-10
  income: number; // 1-10
  learning: number; // 1-10
  flexibility: number; // 1-10
}

export interface OptionComparison {
  optionName: string;
  criteria: OptionCriteria;
  pros: string[];
  cons: string[];
}

export interface BiasPattern {
  biasType: string; // e.g., "Fear of Failure", "FOMO", "Social Pressure", "Analysis Paralysis"
  matchesUser: boolean;
  intensity: number; // 1-10
  explanation: string;
}

export interface FutureScenario {
  optionName: string;
  oneYearOutcome: {
    description: string;
    advantages: string[];
    challenges: string[];
    risks: string[];
  };
}

export interface ValidationExperiment {
  objective: string;
  timeline: string;
  keyMetrics: string[];
  steps: string[];
}

export interface SuggestedActionPath {
  summary: string;
  actionProtocol: {
    days7: string[];
    days14: string[];
    days30: string[];
  };
  validationExperiment: ValidationExperiment;
}

export interface AlayaReport {
  coreValues: CoreValue[];
  decisionStyle: DecisionStyle;
  hiddenBlockers: HiddenBlocker[];
  optionsCompared: OptionComparison[];
  biasAnalysis: BiasPattern[];
  futureScenarios: FutureScenario[];
  suggestedActionPath: SuggestedActionPath;
  confidenceLevel: number; // e.g., 78
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  category: "values" | "fears" | "context";
  suggestedOptions: string[];
}

export interface SurveyAnswers {
  [questionId: string]: string;
}

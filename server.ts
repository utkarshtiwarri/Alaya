import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: [
      "https://alaya-nine.vercel.app",
      "http://localhost:3000",
    ],
  })
);
app.use(express.json());

// Lazy-loaded Gemini AI client utility to prevent crashes if the API key is not yet set
let aiClient: GoogleGenAI | null = null;

// Mock/demo mode: when true, endpoints return static example responses so you can demo
// the app without a live AI key. Set `MOCK_MODE=true` in your `.env` to enable.
const MOCK_MODE = process.env.MOCK_MODE === "true";

function generateMockQuestions(dilemma: string) {
  return [
    {
      id: "q1",
      question: `Which outcome matters more to you in this dilemma: growth, stability, or learning?`,
      category: "values",
      suggestedOptions: ["Growth", "Stability", "Learning", "Not sure / custom"]
    },
    {
      id: "q2",
      question: `What is your biggest unspoken fear about this choice?`,
      category: "fears",
      suggestedOptions: ["Failing", "Letting people down", "Missing opportunities", "Other / custom"]
    },
    {
      id: "q3",
      question: `Which constraint matters most right now? (time, money, location)`,
      category: "context",
      suggestedOptions: ["Time", "Money", "Location", "Other / custom"]
    }
  ];
}

function generateMockReport(dilemma: string, answers: any) {
  return {
    coreValues: [
      { value: "Growth", explanation: "You value continuous learning and challenge.", importance: 9 },
      { value: "Security", explanation: "You care about stable income and predictability.", importance: 7 }
    ],
    decisionStyle: { style: "Analytical Dreamer", description: "Balances data with long-term vision." },
    hiddenBlockers: [
      { blocker: "Fear of failure", description: "Worries about disappointing others.", intensity: 6 }
    ],
    optionsCompared: [
      {
        optionName: "Option A",
        criteria: { risk: 6, growth: 9, income: 5, learning: 9, flexibility: 6 },
        pros: ["High learning", "Exciting"],
        cons: ["Uncertain income", "Long hours"]
      },
      {
        optionName: "Option B",
        criteria: { risk: 3, growth: 5, income: 8, learning: 4, flexibility: 7 },
        pros: ["Stable income", "Predictable schedule"],
        cons: ["Less rapid growth", "Less creative control"]
      }
    ],
    biasAnalysis: [
      { biasType: "Loss Aversion", matchesUser: true, intensity: 6, explanation: "Overweights potential losses compared to gains." }
    ],
    futureScenarios: [
      { optionName: "Option A", oneYearOutcome: { description: "Steep learning curve with project wins.", advantages: ["Skills growth"], challenges: ["Burnout risk"], risks: ["Income drops"] } },
      { optionName: "Option B", oneYearOutcome: { description: "Consistent progress and stable earnings.", advantages: ["Financial stability"], challenges: ["Slower growth"], risks: ["Regret over missed opportunities"] } }
    ],
    suggestedActionPath: {
      summary: "Run a two-week validation experiment focusing on high-impact tests.",
      actionProtocol: { days7: ["List measurable outcomes", "Speak to one mentor"], days14: ["Run short trial", "Measure metrics"], days30: ["Review results", "Decide next step"] },
      validationExperiment: { objective: "Test option viability", timeline: "14 days", keyMetrics: ["Time spent", "Progress made"], steps: ["Prototype", "User feedback"] }
    },
    confidenceLevel: 72
  };
}

function getGeminiClient(): GoogleGenAI {
  if (MOCK_MODE) {
    throw new Error("Mock mode enabled: Gemini client is not available in mock mode.");
  }

  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not defined. Please add it in your env file."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// 1. Endpoint: Generate personalized follow-up questions
// -------------------------------------------------------------
app.post("/api/generate-questions", async (req, res) => {
  const { dilemma } = req.body;
  if (!dilemma || typeof dilemma !== "string") {
    return res.status(400).json({ error: "dilemma string is required" });
  }

  try {
    if (MOCK_MODE) {
      const questions = generateMockQuestions(dilemma);
      return res.json({ questions });
    }

    const ai = getGeminiClient();
    
    const prompt = `
The user has provided the following life decision dilemma:
"${dilemma}"

Please review this dilemma and generate three (3) highly targeted, deeply introspective follow-up questions.
Each question should try to drill down into:
1. The user's subconscious values (e.g., learning, reputation, wealth, freedom, security).
2. The user's unexpressed fears (e.g., fear of failure, fear of judgment, FOMO, loss of security).
3. The real-world situational constraints or context.

For each question, provide 4 recommended multiple-choice options or quick-select values that help the user express their feelings, but also keep an option for them to input custom responses.

Respond strictly with a JSON array matches this schema:
[
  {
    "id": "q1",
    "question": "Clear, deep question text related to values",
    "category": "values",
    "suggestedOptions": ["Option A text", "Option B text", "Option C text", "Option D text"]
  },
  ...
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                description: "Choose 'values', 'fears', or 'context'"
              },
              suggestedOptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "question", "category", "suggestedOptions"]
          }
        },
        systemInstruction: "You are Alaya, the premier AI Thinking Partner. You ask brief, highly precise, introspective questions design to narrow down subconscious biases and values in choices."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response returned from Gemini.");
    }

    let questions;
    try {
      questions = JSON.parse(text.trim());
    } catch (parseError) {
      console.error("Gemini JSON parse failed for questions response:", text, parseError);
      throw new Error("Invalid AI response format while generating questions.");
    }

    return res.json({ questions });
  } catch (err: any) {
    console.error("Error generating questions:", err);
    if (err.status === 429) {
      return res.status(429).json({
        error: "Daily AI quota reached. Please try again later."
      });
    }
    return res.status(500).json({
      error: err.message || "Failed to generate follow-up questions"
    });
  }
});

// -------------------------------------------------------------
// 2. Endpoint: Generate the high-fidelity Decision DNA Report
// -------------------------------------------------------------
app.post("/api/generate-report", async (req, res) => {
  const { dilemma, answers } = req.body;
  if (!dilemma) {
    return res.status(400).json({ error: "dilemma is required" });
  }

  try {
    if (MOCK_MODE) {
      const report = generateMockReport(dilemma, answers);
      return res.json({ report });
    }

    const ai = getGeminiClient();

    // Map the answers into a string format for prompt context
    let answersContext = "None provided.";
    if (answers && typeof answers === "object") {
      answersContext = Object.entries(answers)
        .map(([qId, answer]) => `- Question Id [${qId}]: ${answer}`)
        .join("\n");
    }

    const prompt = `
User's Dilemma:
"${dilemma}"

User's Responses to Follow-up Questions:
${answersContext}

You are an expert decision analyst, psychologist, and philosophical counselor. Provide a comprehensive, life-changing decision analysis report.
Never choose for the user. Empower them with structural analysis and an action plan instead.

Analyze the dilemma across these categories:
1. **Core Values Mapping**: Map 3-4 core values affected, explain why, and give an importance score (1-10).
2. **Decision-making Style**: Describe their custom cognitive style (e.g., "Analytical Overthinker", "Risk-Averse Dreamer").
3. **Hidden Blockers & Subconscious Biases**: Identify elements holding them back (e.g. Fear of Failure, Perfectionism, FOMO) with intensity levels (1-10).
4. **Tradeoff Analyzer**: Extract 2 key options from the dilemma. Compare them side-by-side using numerical ratings (1 to 10) across:
   - Risk
   - Growth
   - Income
   - Learning
   - Flexibility
   Also provide the brief Pros and Cons (2 highlights each) for these options.
5. **Bias Detector**: Analyze 3 cognitive biases affecting this decision (e.g. Fear of Failure, FOMO, Social Pressure, sunk cost bias) explaining how it manifests here.
6. **Future Scenario Simulation (1 year later)**: For each of the options, simulate a highly realistic, visually grounding scene of what life looks like 1 year later if they commit fully. State the advantages, the day-to-day challenges, and the potential structural risks.
7. **Action Protocol Generator**: Create the ultimate validation plan! Detail:
   - 7-Day Plan (e.g., reading, talking to 1 contact, logging thoughts)
   - 14-Day Plan (e.g., active trial, building placeholder, creating outlines)
   - 30-Day Plan (e.g., re-evaluating metrics, small commitment threshold)
   - A structured validation mini-experiment (with Objective, Timeline, Key Metrics to watch, and precise action steps).
8. **Confidence Score**: Calculate an intelligent confidence score (percent, e.g., 82) representing how clear their priorities are, given their current feedback, and explain why.

Validate that your response is valid JSON fitting the requested structure.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreValues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  importance: { type: Type.INTEGER }
                },
                required: ["value", "explanation", "importance"]
              }
            },
            decisionStyle: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["style", "description"]
            },
            hiddenBlockers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  blocker: { type: Type.STRING },
                  description: { type: Type.STRING },
                  intensity: { type: Type.INTEGER }
                },
                required: ["blocker", "description", "intensity"]
              }
            },
            optionsCompared: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING },
                  criteria: {
                    type: Type.OBJECT,
                    properties: {
                      risk: { type: Type.INTEGER },
                      growth: { type: Type.INTEGER },
                      income: { type: Type.INTEGER },
                      learning: { type: Type.INTEGER },
                      flexibility: { type: Type.INTEGER }
                    },
                    required: ["risk", "growth", "income", "learning", "flexibility"]
                  },
                  pros: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["optionName", "criteria", "pros", "cons"]
              }
            },
            biasAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  biasType: { type: Type.STRING },
                  matchesUser: { type: Type.BOOLEAN },
                  intensity: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["biasType", "matchesUser", "intensity", "explanation"]
              }
            },
            futureScenarios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING },
                  oneYearOutcome: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      advantages: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      challenges: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      risks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["description", "advantages", "challenges", "risks"]
                  }
                },
                required: ["optionName", "oneYearOutcome"]
              }
            },
            suggestedActionPath: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                actionProtocol: {
                  type: Type.OBJECT,
                  properties: {
                    days7: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    days14: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    days30: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["days7", "days14", "days30"]
                },
                validationExperiment: {
                  type: Type.OBJECT,
                  properties: {
                    objective: { type: Type.STRING },
                    timeline: { type: Type.STRING },
                    keyMetrics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["objective", "timeline", "keyMetrics", "steps"]
                }
              },
              required: ["summary", "actionProtocol", "validationExperiment"]
            },
            confidenceLevel: { type: Type.INTEGER }
          },
          required: [
            "coreValues",
            "decisionStyle",
            "hiddenBlockers",
            "optionsCompared",
            "biasAnalysis",
            "futureScenarios",
            "suggestedActionPath",
            "confidenceLevel"
          ]
        },
        systemInstruction: "You are Alaya, an elite cognitive behavioral decision specialist. You analyze user's statements to reveal their subconscious priorities and cognitive style without ever deciding for them."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response returned from Gemini.");
    }

    let report;
    try {
      report = JSON.parse(text.trim());
    } catch (parseError) {
      console.error("Gemini JSON parse failed for report response:", text, parseError);
      throw new Error("Invalid AI response format while generating the report.");
    }

    return res.json({ report });
  } catch (err: any) {
    console.error("Error generating report:", err);
    if (err.status === 429) {
      return res.status(429).json({
        error: "Daily AI quota reached. Please try again later."
      });
    }
    return res.status(500).json({
      error: err.message || "Failed to generate decision report"
    });
  }
});

// Serve frontend assets in production or use Vite middleware in dev
const runViteMiddleware = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alaya backend running on http://localhost:${PORT}`);
  });
};

runViteMiddleware();

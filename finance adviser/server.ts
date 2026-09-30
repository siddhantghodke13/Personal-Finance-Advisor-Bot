import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK according to skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const SYSTEM_PROMPT = `You are a personal finance education assistant in an application called "Personal Finance Advisor Bot".
Analyze the user's provided financial information and provide clear, practical, general financial guidance.
Do not claim to be a certified financial advisor. Do not guarantee investment returns. Clearly mention when professional financial advice may be appropriate.
Use Indian Rupees (INR, symbol ₹) for all figures. Keep suggestions structured, realistic, and positive.`;

// API Route: Ask Finance Question
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, financialData } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: "Question is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        answer: `⚠️ Gemini API Key is not configured yet. 
        
In demo mode, here is a general financial guideline:
- Standard 50-30-20 rule allocates 50% to Needs (Rent, Groceries, Utilities), 30% to Wants (Dining, Entertainment), and 20% to Savings.
- For "${question}": Track your discretionary expenses for 14 days and identify recurring subscriptions or food delivery charges you can replace with meal prep or consolidated purchases.`,
      });
    }

    const contextStr = JSON.stringify(financialData || {});
    const prompt = `${SYSTEM_PROMPT}

User's Financial Profile Data:
${contextStr}

User Question:
"${question}"

Provide practical, educational advice in well-formatted markdown with bullet points and clear takeaways.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      answer: response.text || "No response received.",
    });
  } catch (err: any) {
    console.error("AI Ask error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to process AI question.",
    });
  }
});

// API Route: Generate Smart Budget
app.post("/api/ai/generate-budget", async (req, res) => {
  try {
    const { monthlyIncome = 60000, financialGoal, categories, recentExpenses } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Algorithmic 50-30-20 fallback
      const income = Number(monthlyIncome) || 60000;
      return res.json({
        success: true,
        budget: [
          { category: "Rent", amount: Math.round(income * 0.3), reason: "Housing & Accommodation (approx 30%)" },
          { category: "Food", amount: Math.round(income * 0.15), reason: "Groceries and basic nutrition (approx 15%)" },
          { category: "Transport", amount: Math.round(income * 0.08), reason: "Fuel, public transit & commute (approx 8%)" },
          { category: "Utilities", amount: Math.round(income * 0.06), reason: "Electricity, internet, water & phone (approx 6%)" },
          { category: "Entertainment", amount: Math.round(income * 0.08), reason: "Discretionary leisure & hobbies (approx 8%)" },
          { category: "Shopping", amount: Math.round(income * 0.08), reason: "Clothing & miscellaneous personal items (approx 8%)" },
          { category: "Healthcare", amount: Math.round(income * 0.05), reason: "Medicines & routine wellness (approx 5%)" },
        ],
        savings_target: Math.round(income * 0.15),
        emergency_fund: Math.round(income * 0.05),
        summary: `Standard 50/30/20 balanced budget generated for ₹${income.toLocaleString("en-IN")} monthly income.`,
      });
    }

    const prompt = `Analyze this profile and generate a monthly budget in INR (₹) strictly adhering to the 50/30/20 rule:
Monthly Income: ₹${monthlyIncome}
Financial Goal: ${financialGoal || "Save 20%"}
Categories: ${(categories || []).join(", ")}
Recent Expenses: ${JSON.stringify(recentExpenses || [])}

Respond STRICTLY with a valid JSON object matching this schema:
{
  "budget": [
    { "category": "Food", "amount": 6000, "reason": "Reason for amount" }
  ],
  "savings_target": 10000,
  "emergency_fund": 4000,
  "summary": "Short explanation of this budget"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      ...parsed,
    });
  } catch (err: any) {
    console.error("AI Budget generation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to generate AI budget.",
    });
  }
});

// API Route: Deep Spending Analysis
app.post("/api/ai/analyze-spending", async (req, res) => {
  try {
    const { financialData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        analysis: `📊 **Spending Pattern Analysis (Demo Mode)**
- **Cash Flow Health:** Balanced cash flow with positive net surplus.
- **Top Expense Area:** Food and Rent comprise the majority of total monthly outflow.
- **Optimization Strategy:** Consider setting automated transfers on payday for your savings goals before beginning discretionary weekend spending.`,
      });
    }

    const prompt = `${SYSTEM_PROMPT}
Please provide an insightful, educational spending analysis based on the following financial records:
${JSON.stringify(financialData || {})}

Highlight:
1. High-spending categories
2. Savings rate evaluation
3. 3 realistic action items to reduce unnecessary leakage in INR.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      analysis: response.text || "Analysis complete.",
    });
  } catch (err: any) {
    console.error("Spending analysis error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to analyze spending.",
    });
  }
});

// API Route: Browse / Download Python Flask files
app.get("/api/python-files", (req, res) => {
  const baseDir = path.join(__dirname, "personal_finance_advisor");
  const filesList: { path: string; name: string; content: string }[] = [];

  function readDirRecursive(dir: string, prefix = "") {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === "__pycache__" || item.endsWith(".pyc") || item === "instance") continue;
      const fullPath = path.join(dir, item);
      const relPath = prefix ? `${prefix}/${item}` : item;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readDirRecursive(fullPath, relPath);
      } else {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          filesList.push({ path: relPath, name: item, content });
        } catch {
          // ignore binary files
        }
      }
    }
  }

  readDirRecursive(baseDir);
  return res.json({ files: filesList });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Fallback cognitive coach engine if API key is not present or rate limited
function generateSocraticFallback(
  userMessage: string,
  currentPhase: number,
  task: string,
  language: string,
  isStuckOrError: boolean
): { reply: string; phase: number; fadedSnippet?: string } {
  const lower = (userMessage || "").toLowerCase();

  if (isStuckOrError || lower.includes("stuck") || lower.includes("confused") || lower.includes("error")) {
    return {
      reply: "Before fixing the syntax, let's step back into the mental model. What did you expect this operator or logic step to do versus what it actually does right now?",
      phase: currentPhase,
    };
  }

  if (currentPhase === 1) {
    // Phase 1: Logic Articulation
    if (lower.length < 15 || lower.includes("how") || lower.includes("help") || lower.includes("start")) {
      return {
        reply: `Welcome to Compiler Within. To solve "${task}", let's start at the foundation. In plain everyday words, what do you want to do first?`,
        phase: 1,
      };
    }
    // Learner provided logic articulation, move to Algorithmic Mapping
    return {
      reply: `Good intuition. Now let's map the flow: What exact sequence of steps and boundary conditions (like empty inputs or edge values) must happen to execute that logic?`,
      phase: 2,
    };
  } else if (currentPhase === 2) {
    // Phase 2: Algorithmic Mapping -> Phase 3 Faded Syntax
    const sampleSnippet =
      language === "python"
        ? `def solve(data):\n    if not ___:\n        return ___\n    result = []\n    for item in data:\n        if ___:\n            result.append(item)\n    return result`
        : `function solve(data) {\n    if (___) return ___;\n    const result = [];\n    for (const item of data) {\n        if (___) {\n            result.push(item);\n        }\n    }\n    return result;\n}`;

    return {
      reply: `Your algorithmic steps are sound. Let's bridge that thought into ${language}. Fill in the blanks in this faded template: what belongs in the condition?`,
      phase: 3,
      fadedSnippet: sampleSnippet,
    };
  } else {
    // Phase 3: Faded Syntax Construction
    if (lower.includes("___") || lower.includes("fill") || lower.includes("return") || lower.includes("if")) {
      return {
        reply: "You're getting closer. Look carefully at the first blank: what expression evaluates whether the collection is empty or meets your boundary check?",
        phase: 3,
      };
    }
    return {
      reply: "Notice how your condition interacts with the loop. What variable must be updated each cycle to prevent an infinite sequence?",
      phase: 3,
    };
  }
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Coach chat endpoint
app.post("/api/coach/chat", async (req, res) => {
  try {
    const {
      history = [],
      userMessage = "",
      phase = 1,
      language = "python",
      task = "Check if a string is a palindrome",
      isStuckOrError = false,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      const fallback = generateSocraticFallback(userMessage, phase, task, language, isStuckOrError);
      return res.json({
        reply: fallback.reply,
        phase: fallback.phase,
        fadedSnippet: fallback.fadedSnippet,
        wordCount: fallback.reply.split(/\s+/).filter(Boolean).length,
        source: "socratic-engine",
      });
    }

    const systemPrompt = `ROLE:
You are "Compiler Within," a Socratic cognitive programming coach. Your goal is to train the learner's brain to bridge the gap between abstract ideas and working code syntax without ever giving them the code directly.

RULES & PEDAGOGY:
1. NEVER output direct code solutions, syntax blocks, or explicit copy-pasteable answers.
2. Break down every task into 3 strict phases:
   - Phase 1: Logic Articulation (Ask "What do you want to do first in plain words?")
   - Phase 2: Algorithmic Mapping (Ask about sequence, conditions, and boundary conditions)
   - Phase 3: Faded Syntax Construction (Provide fill-in-the-blank code templates with '___')
3. HESITATION / ERROR HANDLING:
   - If the user is confused or makes a mistake, ask an "Error Psychology" question: "What did you expect this operator/logic to do versus what it actually does?"
4. RESPONSE FORMAT:
   - Keep answers strictly under 80 words.
   - Always end with ONE diagnostic question or a faded code snippet with '___' for the user to complete.

CURRENT METADATA:
- Target Problem: "${task}"
- Programming Language: "${language}"
- Current Phase Number: ${phase}
- Learner Stuck/Error Flag: ${isStuckOrError ? "TRUE (Prioritize Error Psychology inquiry)" : "FALSE"}

Decide the appropriate Phase (1, 2, or 3) for the learner based on whether they have demonstrated clear plain-logic understanding (Phase 1) and algorithmic boundary awareness (Phase 2).
If in Phase 3, you MAY provide a short faded syntax snippet containing '___' placeholders.

Format your response as valid JSON with the following structure:
{
  "reply": "Your Socratic response under 80 words ending with ONE diagnostic question or faded snippet prompt",
  "phase": 1, 2, or 3,
  "fadedSnippet": "optional short code snippet with '___' blanks, or null",
  "diagnosticQuestion": "the specific concluding question or challenge"
}`;

    // Convert history to contents for Gemini
    const conversationContents = [];
    conversationContents.push({
      role: "user",
      parts: [{ text: `Task: ${task}. Target language: ${language}. Ready.` }],
    });
    conversationContents.push({
      role: "model",
      parts: [{ text: `{"reply":"Welcome. To tackle '${task}', let's start in plain words: what do you want to do first?","phase":1,"fadedSnippet":null,"diagnosticQuestion":"What do you want to do first in plain words?"}` }],
    });

    for (const msg of history.slice(-6)) {
      conversationContents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    const currentPrompt = isStuckOrError
      ? `User is stuck or reported an error: "${userMessage}". Remember to ask an Error Psychology question: "What did you expect this operator/logic to do versus what it actually does?" Word count must be under 80 words.`
      : `User response: "${userMessage}". Current phase is ${phase}. Maintain Socratic pedagogy, no direct solutions, under 80 words.`;

    conversationContents.push({
      role: "user",
      parts: [{ text: currentPrompt }],
    });

    const callPromise = ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: conversationContents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    // Generous 25s timeout for network latency
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Gemini request exceeded 25s timeout")), 25000);
    });

    let geminiResponse: any;
    try {
      geminiResponse = await Promise.race([callPromise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    const responseText = geminiResponse.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        reply: responseText.slice(0, 300),
        phase: phase,
        fadedSnippet: null,
      };
    }

    const reply = parsedData.reply || "What do you think should happen next in this step?";
    const wordCount = reply.split(/\s+/).filter(Boolean).length;

    res.json({
      reply,
      phase: Number(parsedData.phase) || phase,
      fadedSnippet: parsedData.fadedSnippet || null,
      diagnosticQuestion: parsedData.diagnosticQuestion || null,
      wordCount,
      source: "gemini-3.6-flash",
    });
  } catch (error: any) {
    console.warn("Gemini generation fallback engaged:", error?.message || error);
    const fallback = generateSocraticFallback(
      req.body?.userMessage || "",
      req.body?.phase || 1,
      req.body?.task || "algorithm",
      req.body?.language || "python",
      Boolean(req.body?.isStuckOrError)
    );
    res.json({
      reply: fallback.reply,
      phase: fallback.phase,
      fadedSnippet: fallback.fadedSnippet,
      wordCount: fallback.reply.split(/\s+/).filter(Boolean).length,
      source: "socratic-fallback",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Compiler Within server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

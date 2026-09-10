import React, { useState, useEffect } from "react";
import { Code2, Send, RotateCcw, CheckCircle2, HelpCircle, Star, Sparkles } from "lucide-react";
import { SupportedLanguage } from "../types";

interface FadedSyntaxEditorProps {
  initialSnippet: string | null;
  language: SupportedLanguage;
  onSubmitAnswer: (completedCode: string, rawSnippet: string) => void;
  onAskStuck: () => void;
  onOpenConfidenceRating?: () => void;
  lastRatedScore?: number | null;
}

export const FadedSyntaxEditor: React.FC<FadedSyntaxEditorProps> = ({
  initialSnippet,
  language,
  onSubmitAnswer,
  onAskStuck,
  onOpenConfidenceRating,
  lastRatedScore,
}) => {
  const defaultSnippet =
    initialSnippet ||
    (language === "python"
      ? `def solve(s):\n    left = 0\n    right = ___\n    while left < right:\n        if s[left] != ___:\n            return False\n        left += 1\n        right -= 1\n    return True`
      : `function solve(s) {\n    let left = 0;\n    let right = ___;\n    while (left < right) {\n        if (s[left] !== ___) {\n            return false;\n        }\n        left++;\n        right--;\n    }\n    return true;\n}`);

  const [snippetText, setSnippetText] = useState(defaultSnippet);
  const [blankValues, setBlankValues] = useState<{ [index: number]: string }>({});

  useEffect(() => {
    if (initialSnippet) {
      setSnippetText(initialSnippet);
      setBlankValues({});
    }
  }, [initialSnippet]);

  // Parse snippet parts split by '___'
  const parts = snippetText.split("___");
  const blanksCount = parts.length - 1;

  const handleBlankChange = (index: number, val: string) => {
    setBlankValues((prev) => ({
      ...prev,
      [index]: val,
    }));
  };

  // Reconstruct the filled code
  const getAssembledCode = () => {
    let result = "";
    for (let i = 0; i < parts.length; i++) {
      result += parts[i];
      if (i < blanksCount) {
        result += blankValues[i] && blankValues[i].trim() ? blankValues[i] : "___";
      }
    }
    return result;
  };

  const handleReset = () => {
    setBlankValues({});
  };

  const isComplete =
    blanksCount > 0 &&
    Array.from({ length: blanksCount }).every((_, i) => blankValues[i] && blankValues[i].trim().length > 0);

  const handleSubmit = () => {
    const assembled = getAssembledCode();
    onSubmitAnswer(assembled, snippetText);
    if (onOpenConfidenceRating) {
      onOpenConfidenceRating();
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/80 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-xs font-mono font-medium text-stone-400 pl-2">
            Phase 3: Faded Syntax Workbench ({language})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 px-2 py-1 rounded bg-stone-800/60 hover:bg-stone-800 transition"
            title="Reset Blanks"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-2 bg-stone-900/90 border-b border-stone-800 text-[11px] text-amber-300/90 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          Fill in the {blanksCount} missing <code className="bg-stone-800 px-1 rounded text-amber-200">___</code> slots below:
        </span>
        {isComplete ? (
          <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono">
            <CheckCircle2 className="w-3 h-3" /> Ready to test
          </span>
        ) : (
          <span className="text-stone-500 text-[11px] font-mono">
            {Object.keys(blankValues).filter((k) => blankValues[Number(k)]?.trim()).length} of {blanksCount} filled
          </span>
        )}
      </div>

      {/* Interactive Code Area */}
      <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed bg-stone-950/40">
        <div className="whitespace-pre-wrap select-text">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="text-stone-300">{part}</span>
              {index < blanksCount && (
                <span className="inline-block mx-1 my-0.5 align-middle">
                  <input
                    type="text"
                    id={`blank-input-${index}`}
                    value={blankValues[index] || ""}
                    onChange={(e) => handleBlankChange(index, e.target.value)}
                    placeholder="___"
                    className="px-2 py-0.5 text-xs font-mono font-semibold bg-amber-950/60 border border-amber-500/70 text-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 min-w-[70px] placeholder:text-stone-600 transition text-center"
                    style={{
                      width: Math.max(70, ((blankValues[index]?.length || 3) + 3) * 8) + "px",
                    }}
                  />
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onAskStuck}
          className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-900 transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>I'm not sure about this blank</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenConfidenceRating && (
            <button
              id="rate-task-confidence-btn"
              onClick={onOpenConfidenceRating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                lastRatedScore
                  ? "bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50"
                  : "bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800"
              }`}
              title="Rate your confidence to adjust difficulty"
            >
              <Star className={`w-3.5 h-3.5 ${lastRatedScore ? "fill-amber-400 text-amber-400" : "text-stone-400"}`} />
              <span>{lastRatedScore ? `Confidence: ${lastRatedScore}★` : "Rate Confidence"}</span>
            </button>
          )}

          <button
            id="submit-faded-code-btn"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs shadow transition active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Faded Construction</span>
          </button>
        </div>
      </div>
    </div>
  );
};

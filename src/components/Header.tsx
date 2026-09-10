import React, { useState } from "react";
import { Terminal, Brain, Sparkles, BookOpen, ShieldCheck, X, TrendingUp } from "lucide-react";
import { SupportedLanguage, DifficultyProfile } from "../types";

interface HeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenChallengeSelector: () => void;
  currentChallengeTitle: string;
  profile?: DifficultyProfile;
  onOpenAdaptiveProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenChallengeSelector,
  currentChallengeTitle,
  profile,
  onOpenAdaptiveProfile,
}) => {
  const [showPedagogyModal, setShowPedagogyModal] = useState(false);

  return (
    <header className="border-b border-stone-200 bg-stone-50/90 backdrop-blur px-4 py-3 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-sm font-mono font-bold text-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stone-900 tracking-tight flex items-center gap-1.5">
                Compiler Within
                <span className="text-[11px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                  Socratic Coach
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-600 hidden sm:block">
              Cognitive bridging: Abstract logic → Algorithmic mapping → Faded syntax
            </p>
          </div>
        </div>

        {/* Current task button & language selector */}
        <div className="flex items-center flex-wrap gap-2 text-xs w-full sm:w-auto justify-end">
          {profile && onOpenAdaptiveProfile && (
            <button
              id="adaptive-difficulty-badge-btn"
              onClick={onOpenAdaptiveProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80 transition font-medium text-xs cursor-pointer shadow-2xs"
              title="View Adaptive Difficulty Calibration"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              <span>Level: <strong className="font-mono">{profile.calibratedLevel}</strong></span>
              {profile.averageConfidence > 0 && (
                <span className="text-[10px] font-mono text-amber-800 hidden md:inline">
                  ({profile.averageConfidence}★)
                </span>
              )}
            </button>
          )}

          <button
            id="challenge-select-button"
            onClick={onOpenChallengeSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition font-medium text-xs max-w-[200px] truncate cursor-pointer"
            title="Switch Challenge"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-stone-600" />
            <span className="truncate">{currentChallengeTitle}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-stone-200/70 rounded-lg p-1">
            <span className="text-[11px] font-mono text-stone-600 px-1.5">Lang:</span>
            <select
              id="language-select"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              aria-label="Select Target Programming Language"
              className="bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs py-0.5 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono cursor-pointer"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
            </select>
          </div>

          <button
            id="pedagogy-rules-btn"
            onClick={() => setShowPedagogyModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 transition"
            title="Compiler Within Pedagogy & Rules"
          >
            <Brain className="w-3.5 h-3.5 text-stone-800" />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* Pedagogy Modal */}
      {showPedagogyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-semibold text-stone-900">Compiler Within Cognitive Rules</h2>
              </div>
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-amber-950 font-medium">
                "Your goal is to train the learner's brain to bridge the gap between abstract ideas and working code syntax without ever giving them the code directly."
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 mb-1">1. Zero Direct Solutions</h3>
                <p>The coach will never output copy-pasteable answers or full syntax blocks. Understanding must come from your own mental compiler.</p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 mb-1">2. Strict 3-Phase Progression</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Phase 1: Logic Articulation</strong> — Plain words first: "What do you want to do first?"</li>
                  <li><strong>Phase 2: Algorithmic Mapping</strong> — Sequence, branches, and boundary edge cases.</li>
                  <li><strong>Phase 3: Faded Syntax Construction</strong> — Fill-in-the-blank code templates with <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">___</code>.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 mb-1">3. Error Psychology</h3>
                <p>When stuck or mistaken, the coach asks: <em>"What did you expect this operator/logic to do versus what it actually does?"</em></p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 mb-1">4. Cognitive Brevity</h3>
                <p>Responses are capped strictly under <strong>80 words</strong> and always conclude with ONE diagnostic question or faded prompt.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="px-4 py-2 bg-stone-900 text-stone-50 rounded-xl text-xs font-medium hover:bg-stone-800 transition"
              >
                Understood, Train My Brain
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState } from "react";
import { Challenge, ChallengeDifficulty } from "../types";
import { SAMPLE_CHALLENGES } from "../data/sampleChallenges";
import { X, Check, Plus, BookOpen, Sparkles, TrendingUp } from "lucide-react";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChallenge: Challenge;
  onSelectChallenge: (c: Challenge) => void;
  recommendedChallengeId?: string;
  calibratedLevel?: ChallengeDifficulty;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  currentChallenge,
  onSelectChallenge,
  recommendedChallengeId,
  calibratedLevel,
}) => {
  const [activeTab, setActiveTab] = useState<"library" | "custom">("library");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");

  if (!isOpen) return null;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newChallenge: Challenge = {
      id: "custom-" + Date.now(),
      title: customTitle.trim(),
      category: "Algorithms",
      difficulty: "Intermediate",
      description: customDesc.trim() || "User-defined coding challenge.",
      sampleInput: customInput.trim() || "N/A",
      sampleOutput: customOutput.trim() || "N/A",
      starterLogicPrompt: "In plain words, what is the core requirement of this custom task?",
    };

    onSelectChallenge(newChallenge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Select Programming Challenge</h2>
            <p className="text-xs text-stone-500">Pick a problem or bring your own to coach through</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-stone-100 px-6 gap-4 bg-stone-50/70">
          <button
            onClick={() => setActiveTab("library")}
            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "library"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Library</span>
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "custom"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Problem</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "library" ? (
            <div className="space-y-3">
              {calibratedLevel && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-stone-800">
                      Your Calibrated Difficulty:{" "}
                      <strong className="text-amber-900 font-mono font-bold">{calibratedLevel}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Adaptive Auto-Selected
                  </span>
                </div>
              )}

              {SAMPLE_CHALLENGES.map((challenge) => {
                const isSelected = challenge.id === currentChallenge.id;
                const isRecommended = challenge.id === recommendedChallengeId;
                return (
                  <div
                    key={challenge.id}
                    onClick={() => {
                      onSelectChallenge(challenge);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected
                        ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-400/50"
                        : isRecommended
                        ? "border-amber-300 bg-amber-50/30 hover:border-amber-400"
                        : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-stone-900 text-sm">
                          {challenge.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {challenge.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {challenge.difficulty}
                        </span>
                        {isRecommended && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Recommended for You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {challenge.description}
                      </p>
                      <div className="text-[11px] font-mono text-stone-500 pt-1 flex gap-4">
                        <span>Input: <span className="text-stone-700">{challenge.sampleInput}</span></span>
                        <span>Output: <span className="text-stone-700">{challenge.sampleOutput}</span></span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Problem Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Find Max Subarray Sum / Debounce Function"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Problem Statement / Goal</label>
                <textarea
                  rows={3}
                  placeholder="Describe the problem, input data, constraints..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sample Input</label>
                  <input
                    type="text"
                    placeholder="e.g. [1, -2, 3, 4]"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sample Output</label>
                  <input
                    type="text"
                    placeholder="e.g. 7"
                    value={customOutput}
                    onChange={(e) => setCustomOutput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 font-medium shadow-sm transition"
                >
                  Start Socratic Session
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

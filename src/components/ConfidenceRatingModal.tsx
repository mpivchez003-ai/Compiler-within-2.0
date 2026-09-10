import React, { useState } from "react";
import { Challenge, SupportedLanguage, ConfidenceRating, DifficultyProfile } from "../types";
import { Star, Sparkles, TrendingUp, ArrowRight, Check, X, ShieldAlert, Brain } from "lucide-react";

interface ConfidenceRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChallenge: Challenge;
  language: SupportedLanguage;
  onSaveRating: (score: 1 | 2 | 3 | 4, notes: string) => DifficultyProfile;
  onAcceptRecommendation?: (nextChallenge: Challenge) => void;
  recommendedChallenge?: Challenge;
}

export const ConfidenceRatingModal: React.FC<ConfidenceRatingModalProps> = ({
  isOpen,
  onClose,
  currentChallenge,
  language,
  onSaveRating,
  onAcceptRecommendation,
  recommendedChallenge,
}) => {
  const [selectedScore, setSelectedScore] = useState<1 | 2 | 3 | 4 | null>(null);
  const [notes, setNotes] = useState("");
  const [savedProfile, setSavedProfile] = useState<DifficultyProfile | null>(null);

  if (!isOpen) return null;

  const confidenceLevels: {
    score: 1 | 2 | 3 | 4;
    label: string;
    description: string;
    color: string;
  }[] = [
    {
      score: 1,
      label: "Guessed / High Friction",
      description: "Unsure of the logic or syntax; needed heavy trial-and-error.",
      color: "hover:border-rose-400 hover:bg-rose-50/50",
    },
    {
      score: 2,
      label: "Shaky / Partial Model",
      description: "Understood the general flow, but felt uncertain about boundaries.",
      color: "hover:border-amber-400 hover:bg-amber-50/50",
    },
    {
      score: 3,
      label: "Solid / Clear Understanding",
      description: "Mentally mapped the flow before writing syntax with good clarity.",
      color: "hover:border-emerald-400 hover:bg-emerald-50/50",
    },
    {
      score: 4,
      label: "Effortless / Mastered",
      description: "Completely natural; ready to advance to more complex abstractions.",
      color: "hover:border-indigo-400 hover:bg-indigo-50/50",
    },
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScore) return;

    const newProfile = onSaveRating(selectedScore, notes.trim());
    setSavedProfile(newProfile);
  };

  const handleCloseAll = () => {
    setSelectedScore(null);
    setNotes("");
    setSavedProfile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Faded Syntax Completed: Rate Confidence
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {currentChallenge.title} ({language})
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!savedProfile ? (
            <form onSubmit={handleConfirm} className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                How confidently did your internal mental model predict the missing syntax and boundary conditions?
                Your response automatically adapts future challenge difficulty and cognitive scaffolding.
              </p>

              {/* Confidence Options */}
              <div className="space-y-2">
                {confidenceLevels.map((lvl) => {
                  const isChosen = selectedScore === lvl.score;
                  return (
                    <div
                      key={lvl.score}
                      onClick={() => setSelectedScore(lvl.score)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                        isChosen
                          ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/40"
                          : `border-stone-200 bg-white ${lvl.color}`
                      }`}
                    >
                      <div className="flex items-center pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                            isChosen
                              ? "bg-amber-500 text-white shadow-xs"
                              : "border border-stone-300 text-stone-600"
                          }`}
                        >
                          {lvl.score}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-900">
                            {lvl.label}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < lvl.score
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {lvl.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional note */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-700 block">
                  Optional Reflection Note (What clicked or hesitated?):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Left and right pointer stopping condition felt intuitive"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/60"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-xl transition"
                >
                  Skip
                </button>
                <button
                  id="save-confidence-btn"
                  type="submit"
                  disabled={!selectedScore}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save Rating & Adjust Difficulty</span>
                </button>
              </div>
            </form>
          ) : (
            /* Calibration Result View */
            <div className="space-y-4 py-1">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Adaptive Difficulty Recalibrated!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600">New Target Difficulty:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    {savedProfile.calibratedLevel}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {savedProfile.recommendationReason}
                </p>
                <div className="text-[11px] font-mono text-stone-500 pt-1 border-t border-amber-200/60 flex items-center justify-between">
                  <span>Average Confidence: {savedProfile.averageConfidence} / 4</span>
                  <span>Total Calibrations: {savedProfile.totalRatings}</span>
                </div>
              </div>

              {recommendedChallenge && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                      Recommended Next Challenge
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      {recommendedChallenge.difficulty}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900">
                      {recommendedChallenge.title}
                    </h4>
                    <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">
                      {recommendedChallenge.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-xl transition"
                >
                  Stay on Current
                </button>
                {recommendedChallenge && onAcceptRecommendation && (
                  <button
                    onClick={() => {
                      onAcceptRecommendation(recommendedChallenge);
                      handleCloseAll();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <span>Start {recommendedChallenge.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

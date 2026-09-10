import React from "react";
import { DifficultyProfile, ConfidenceRating, Challenge } from "../types";
import { X, TrendingUp, Star, ShieldCheck, Award, BookOpen, Clock } from "lucide-react";

interface AdaptiveProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DifficultyProfile;
  ratings: ConfidenceRating[];
  onSelectChallenge: (c: Challenge) => void;
  recommendedChallenge?: Challenge;
}

export const AdaptiveProfileModal: React.FC<AdaptiveProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  ratings,
  onSelectChallenge,
  recommendedChallenge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Adaptive Difficulty Calibration
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                Real-time learner calibration based on Socratic confidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold">
                Calibrated Tier
              </span>
              <span className="text-base font-bold text-amber-950 mt-1">
                {profile.calibratedLevel}
              </span>
              <span className="text-[10px] text-amber-800/80 mt-0.5">Auto-adjusted</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Avg Confidence
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-bold text-stone-900 font-mono">
                  {profile.averageConfidence || "0.0"}
                </span>
                <span className="text-[11px] text-stone-400 font-mono">/ 4.0</span>
              </div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.round(profile.averageConfidence)
                        ? "fill-amber-400 text-amber-500"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Completed Tasks
              </span>
              <span className="text-base font-bold text-stone-900 font-mono mt-1">
                {profile.totalRatings}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5">Rated iterations</span>
            </div>
          </div>

          {/* Engine Explanation */}
          <div className="p-3.5 rounded-xl bg-stone-100/70 border border-stone-200 space-y-1.5">
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Current Calibration Logic</span>
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              {profile.recommendationReason}
            </p>
          </div>

          {/* Recommended Next Challenge Card */}
          {recommendedChallenge && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Next Recommended Challenge</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold">
                  {recommendedChallenge.difficulty}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  {recommendedChallenge.title}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  {recommendedChallenge.description}
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectChallenge(recommendedChallenge);
                  onClose();
                }}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Switch to {recommendedChallenge.title}</span>
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}

          {/* Historic Confidence Log */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Confidence Rating History</span>
            </span>

            {ratings.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No confidence ratings logged yet. Complete a Faded Syntax task in Phase 3 to calibrate your difficulty!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ratings.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-stone-200 bg-white flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">
                          {r.challengeTitle}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {r.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {r.language}
                        </span>
                      </div>
                      {r.notes && (
                        <p className="text-stone-600 text-[11px] italic">
                          "{r.notes}"
                        </p>
                      )}
                      <span className="text-[10px] text-stone-400 block">
                        {r.timestamp}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < r.confidenceScore
                                ? "fill-amber-400 text-amber-500"
                                : "text-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-stone-700">
                        Level {r.confidenceScore} / 4
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

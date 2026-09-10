import React from "react";
import { PhaseNumber } from "../types";
import { MessageSquareText, GitFork, Code2, ArrowRight } from "lucide-react";

interface PhaseIndicatorProps {
  currentPhase: PhaseNumber;
  onPhaseSelect?: (phase: PhaseNumber) => void;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ currentPhase, onPhaseSelect }) => {
  const phases = [
    {
      number: 1 as PhaseNumber,
      title: "Phase 1: Logic Articulation",
      question: "What do you want to do first in plain words?",
      desc: "No syntax allowed yet. Describe physical or logical intent.",
      icon: MessageSquareText,
    },
    {
      number: 2 as PhaseNumber,
      title: "Phase 2: Algorithmic Mapping",
      question: "Sequence, conditions, and boundary conditions",
      desc: "Trace loops, branching checks, and edge inputs (empty, bounds).",
      icon: GitFork,
    },
    {
      number: 3 as PhaseNumber,
      title: "Phase 3: Faded Syntax",
      question: "Fill-in-the-blank code templates ('___')",
      desc: "Complete the missing syntax constructs to lock in mastery.",
      icon: Code2,
    },
  ];

  return (
    <section className="bg-white border-b border-stone-200 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            {phases.map((p) => {
              const isActive = currentPhase === p.number;
              const isPast = currentPhase > p.number;
              const Icon = p.icon;

              return (
                <div
                  key={p.number}
                  id={`phase-card-${p.number}`}
                  onClick={() => onPhaseSelect && onPhaseSelect(p.number)}
                  className={`rounded-xl p-3 border transition-all cursor-pointer select-none ${
                    isActive
                      ? "bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/40 shadow-xs"
                      : isPast
                      ? "bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300"
                      : "bg-white border-stone-200 text-stone-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                          isActive
                            ? "bg-amber-600 text-white"
                            : isPast
                            ? "bg-stone-300 text-stone-700"
                            : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        {p.number}
                      </span>
                      <span
                        className={`text-xs font-semibold tracking-tight ${
                          isActive ? "text-amber-950" : isPast ? "text-stone-800" : "text-stone-500"
                        }`}
                      >
                        {p.title}
                      </span>
                    </div>
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? "text-amber-700" : isPast ? "text-stone-500" : "text-stone-400"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[11px] font-medium leading-snug line-clamp-1 ${
                      isActive ? "text-amber-900 font-mono" : "text-stone-600"
                    }`}
                  >
                    "{p.question}"
                  </p>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-stone-200 text-[11px] text-stone-500 font-mono shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>&lt;80 Words Strict Constraint</span>
          </div>
        </div>
      </div>
    </section>
  );
};

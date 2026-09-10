import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { PhaseIndicator } from "./components/PhaseIndicator";
import { ChatPanel } from "./components/ChatPanel";
import { FadedSyntaxEditor } from "./components/FadedSyntaxEditor";
import { Scratchpad } from "./components/Scratchpad";
import { ChallengeModal } from "./components/ChallengeModal";
import { ConfidenceRatingModal } from "./components/ConfidenceRatingModal";
import { AdaptiveProfileModal } from "./components/AdaptiveProfileModal";
import { SAMPLE_CHALLENGES } from "./data/sampleChallenges";
import {
  Challenge,
  ChatMessage,
  ConfidenceRating,
  DifficultyProfile,
  PhaseNumber,
  SupportedLanguage,
} from "./types";
import {
  getStoredConfidenceRatings,
  getStoredDifficultyProfile,
  saveConfidenceRating,
  getRecommendedChallenge,
} from "./utils/adaptiveDifficulty";
import { Code2, Edit3, Sparkles } from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(SAMPLE_CHALLENGES[0]);
  const [currentPhase, setCurrentPhase] = useState<PhaseNumber>(1);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isConfidenceModalOpen, setIsConfidenceModalOpen] = useState(false);
  const [isAdaptiveProfileModalOpen, setIsAdaptiveProfileModalOpen] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<"scratchpad" | "faded">("scratchpad");
  const [activeFadedSnippet, setActiveFadedSnippet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Confidence & Adaptive Difficulty State
  const [ratings, setRatings] = useState<ConfidenceRating[]>(() => getStoredConfidenceRatings());
  const [difficultyProfile, setDifficultyProfile] = useState<DifficultyProfile>(() =>
    getStoredDifficultyProfile()
  );

  // Derive recommended challenge based on current calibration
  const recommendedChallenge = getRecommendedChallenge(
    currentChallenge.id,
    difficultyProfile.calibratedLevel,
    ratings
  );

  // Current challenge confidence rating if already rated
  const currentChallengeRating = ratings.find((r) => r.challengeId === currentChallenge.id);

  // Initial welcome message adhering strictly to Compiler Within rules
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "coach",
      content: `Welcome to Compiler Within. I am your cognitive programming coach. We bridge abstract ideas to working syntax without ever giving you copy-paste solutions.\n\nTo solve "${SAMPLE_CHALLENGES[0].title}", let's start at the foundation.`,
      phase: 1,
      wordCount: 36,
      diagnosticQuestion: "What do you want to do first in plain words?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const handleSendMessage = async (text: string, isStuckOrError: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp,
      isErrorPsychology: isStuckOrError,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === "coach" ? "model" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyPayload,
          userMessage: text,
          phase: currentPhase,
          language,
          task: `${currentChallenge.title}: ${currentChallenge.description}`,
          isStuckOrError,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const newCoachPhase = (Number(data.phase) || currentPhase) as PhaseNumber;
      if (newCoachPhase !== currentPhase) {
        setCurrentPhase(newCoachPhase);
        if (newCoachPhase === 3) {
          setActiveSideTab("faded");
        }
      }

      if (data.fadedSnippet) {
        setActiveFadedSnippet(data.fadedSnippet);
        setActiveSideTab("faded");
      }

      const coachMessage: ChatMessage = {
        id: "coach-" + Date.now(),
        role: "coach",
        content: data.reply,
        phase: newCoachPhase,
        wordCount: data.wordCount,
        fadedSnippet: data.fadedSnippet || null,
        diagnosticQuestion: data.diagnosticQuestion || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (err) {
      console.error("Coach interaction error:", err);
      // Fallback Socratic error psychology response if network dropped
      const fallbackCoachMsg: ChatMessage = {
        id: "coach-fallback-" + Date.now(),
        role: "coach",
        content: isStuckOrError
          ? "What did you expect this operator/logic to do versus what it actually does?"
          : "What do you want to do first in plain words?",
        phase: currentPhase,
        wordCount: 16,
        diagnosticQuestion: isStuckOrError
          ? "What did you expect this operator/logic to do versus what it actually does?"
          : "What do you want to do first in plain words?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackCoachMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setCurrentPhase(1);
    setActiveSideTab("scratchpad");
    setActiveFadedSnippet(null);

    const initialMsg: ChatMessage = {
      id: "init-" + Date.now(),
      role: "coach",
      content: `Challenge switched to "${challenge.title}". Let's articulate the logic before writing any code syntax.`,
      phase: 1,
      wordCount: 19,
      diagnosticQuestion: challenge.starterLogicPrompt || "What do you want to do first in plain words?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialMsg]);
  };

  const handleSaveConfidenceRating = (score: 1 | 2 | 3 | 4, notes: string): DifficultyProfile => {
    const newRating: ConfidenceRating = {
      id: "rating-" + Date.now(),
      timestamp: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      challengeId: currentChallenge.id,
      challengeTitle: currentChallenge.title,
      difficulty: currentChallenge.difficulty,
      language,
      confidenceScore: score,
      notes: notes || undefined,
    };

    const updatedProfile = saveConfidenceRating(newRating);
    setRatings(getStoredConfidenceRatings());
    setDifficultyProfile(updatedProfile);

    // Provide a subtle coach feedback message
    const coachFeedbackMsg: ChatMessage = {
      id: "coach-calib-" + Date.now(),
      role: "coach",
      content: `Cognitive calibration recorded: Confidence Level ${score}/4 on ${currentChallenge.title}.\n\nYour adaptive difficulty is now calibrated to **${updatedProfile.calibratedLevel}**. ${updatedProfile.recommendationReason}`,
      phase: 3,
      wordCount: 30,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, coachFeedbackMsg]);

    return updatedProfile;
  };

  const handleSubmitFadedAnswer = (completedCode: string) => {
    handleSendMessage(`Here is my completed faded syntax hypothesis:\n\n${completedCode}`, false);
    setIsConfidenceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Header with language picker and problem switcher */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onOpenChallengeSelector={() => setIsChallengeModalOpen(true)}
        currentChallengeTitle={currentChallenge.title}
        profile={difficultyProfile}
        onOpenAdaptiveProfile={() => setIsAdaptiveProfileModalOpen(true)}
      />

      {/* 3-Phase Socratic Progress Stepper */}
      <PhaseIndicator
        currentPhase={currentPhase}
        onPhaseSelect={(phase) => setCurrentPhase(phase)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Socratic Chat Dialogue (7 cols on lg) */}
        <section className="lg:col-span-7 h-[calc(100vh-175px)] min-h-[500px]">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            currentPhase={currentPhase}
            onOpenFadedWorkbench={(snippet) => {
              setActiveFadedSnippet(snippet);
              setActiveSideTab("faded");
            }}
            targetTask={currentChallenge.title}
          />
        </section>

        {/* Right Column: Interactive Workbench & Cognitive Scratchpad (5 cols on lg) */}
        <section className="lg:col-span-5 h-[calc(100vh-175px)] min-h-[500px] flex flex-col">
          {/* Side Tab Switcher */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex bg-stone-200/80 p-1 rounded-xl gap-1 text-xs">
              <button
                id="tab-scratchpad-btn"
                onClick={() => setActiveSideTab("scratchpad")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  activeSideTab === "scratchpad"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-700" />
                <span>Logic Scratchpad</span>
              </button>

              <button
                id="tab-faded-btn"
                onClick={() => setActiveSideTab("faded")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  activeSideTab === "faded"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Faded Syntax (Phase 3)</span>
                {currentPhase === 3 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>
            </div>

            <div className="text-[11px] font-mono text-stone-500 hidden sm:block">
              {activeSideTab === "faded" ? "Blanks Construction" : "Cognitive Dry-Run"}
            </div>
          </div>

          {/* Active Tool View */}
          <div className="flex-1 min-h-0">
            {activeSideTab === "faded" ? (
              <FadedSyntaxEditor
                initialSnippet={activeFadedSnippet}
                language={language}
                onSubmitAnswer={handleSubmitFadedAnswer}
                onAskStuck={() => handleSendMessage("I am confused about what operator or logic goes into this blank.", true)}
                onOpenConfidenceRating={() => setIsConfidenceModalOpen(true)}
                lastRatedScore={currentChallengeRating?.confidenceScore ?? null}
              />
            ) : (
              <Scratchpad
                onInsertToChat={(text) => handleSendMessage(text, false)}
                currentPhase={currentPhase}
              />
            )}
          </div>
        </section>
      </main>

      {/* Challenge Selector Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        currentChallenge={currentChallenge}
        onSelectChallenge={handleSelectChallenge}
        recommendedChallengeId={recommendedChallenge?.id}
        calibratedLevel={difficultyProfile.calibratedLevel}
      />

      {/* Confidence Rating & Auto-Difficulty Recalibration Modal */}
      <ConfidenceRatingModal
        isOpen={isConfidenceModalOpen}
        onClose={() => setIsConfidenceModalOpen(false)}
        currentChallenge={currentChallenge}
        language={language}
        onSaveRating={handleSaveConfidenceRating}
        onAcceptRecommendation={handleSelectChallenge}
        recommendedChallenge={recommendedChallenge}
      />

      {/* Adaptive Profile & Calibration History Modal */}
      <AdaptiveProfileModal
        isOpen={isAdaptiveProfileModalOpen}
        onClose={() => setIsAdaptiveProfileModalOpen(false)}
        profile={difficultyProfile}
        ratings={ratings}
        onSelectChallenge={handleSelectChallenge}
        recommendedChallenge={recommendedChallenge}
      />
    </div>
  );
}

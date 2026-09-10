export type PhaseNumber = 1 | 2 | 3;

export interface PhaseInfo {
  number: PhaseNumber;
  title: string;
  subtitle: string;
  questionPrompt: string;
  description: string;
  badgeColor: string;
}

export interface ChatMessage {
  id: string;
  role: "coach" | "user" | "system";
  content: string;
  phase?: PhaseNumber;
  wordCount?: number;
  fadedSnippet?: string | null;
  diagnosticQuestion?: string | null;
  timestamp: string;
  isErrorPsychology?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  category: "Strings" | "Arrays" | "Algorithms" | "Math";
  difficulty: "Beginner" | "Intermediate" | "Challenging";
  description: string;
  sampleInput: string;
  sampleOutput: string;
  starterLogicPrompt: string;
}

export type SupportedLanguage = "python" | "javascript" | "typescript" | "cpp" | "java" | "rust" | "go";

export type ChallengeDifficulty = "Beginner" | "Intermediate" | "Challenging";

export interface ConfidenceRating {
  id: string;
  timestamp: string;
  challengeId: string;
  challengeTitle: string;
  difficulty: ChallengeDifficulty;
  language: SupportedLanguage;
  confidenceScore: 1 | 2 | 3 | 4;
  notes?: string;
}

export interface DifficultyProfile {
  calibratedLevel: ChallengeDifficulty;
  averageConfidence: number;
  totalRatings: number;
  consecutiveHigh: number;
  consecutiveLow: number;
  recommendationReason: string;
}

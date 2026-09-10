import { Challenge, ChallengeDifficulty, ConfidenceRating, DifficultyProfile } from "../types";
import { SAMPLE_CHALLENGES } from "../data/sampleChallenges";

const STORAGE_KEY_CONFIDENCE = "compiler_within_confidence_history";
const STORAGE_KEY_PROFILE = "compiler_within_difficulty_profile";

const DEFAULT_PROFILE: DifficultyProfile = {
  calibratedLevel: "Beginner",
  averageConfidence: 0,
  totalRatings: 0,
  consecutiveHigh: 0,
  consecutiveLow: 0,
  recommendationReason: "Starting calibration: Beginner level chosen to build strong logic foundations.",
};

export function getStoredConfidenceRatings(): ConfidenceRating[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIDENCE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load confidence ratings:", e);
    return [];
  }
}

export function saveConfidenceRating(rating: ConfidenceRating): DifficultyProfile {
  const history = getStoredConfidenceRatings();
  const updatedHistory = [rating, ...history];

  try {
    localStorage.setItem(STORAGE_KEY_CONFIDENCE, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Failed to save confidence rating:", e);
  }

  const updatedProfile = computeDifficultyProfile(updatedHistory);
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
  } catch (e) {
    console.error("Failed to save difficulty profile:", e);
  }

  return updatedProfile;
}

export function getStoredDifficultyProfile(): DifficultyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load difficulty profile:", e);
  }
  const history = getStoredConfidenceRatings();
  return computeDifficultyProfile(history);
}

export function computeDifficultyProfile(history: ConfidenceRating[]): DifficultyProfile {
  if (history.length === 0) {
    return DEFAULT_PROFILE;
  }

  const total = history.length;
  const sum = history.reduce((acc, r) => acc + r.confidenceScore, 0);
  const averageConfidence = Number((sum / total).toFixed(2));

  // Count consecutive high (3 or 4) or low (1 or 2) from most recent
  let consecutiveHigh = 0;
  let consecutiveLow = 0;

  for (const item of history) {
    if (item.confidenceScore >= 3) {
      if (consecutiveLow === 0) consecutiveHigh++;
      else break;
    } else {
      if (consecutiveHigh === 0) consecutiveLow++;
      else break;
    }
  }

  const mostRecent = history[0];
  let calibratedLevel: ChallengeDifficulty = "Beginner";
  let recommendationReason = "";

  // Dynamic calibration logic
  if (averageConfidence >= 3.2 || consecutiveHigh >= 2) {
    if (mostRecent.difficulty === "Challenging" || averageConfidence >= 3.6) {
      calibratedLevel = "Challenging";
      recommendationReason = `High mastery detected (${averageConfidence}/4 avg). Difficulty adjusted to Challenging to build advanced mental models.`;
    } else {
      calibratedLevel = "Intermediate";
      recommendationReason = `Strong confidence (${mostRecent.confidenceScore}/4 on "${mostRecent.challengeTitle}"). Difficulty stepped up to Intermediate for deeper multi-step logic.`;
    }
  } else if (averageConfidence <= 2.0 || consecutiveLow >= 2) {
    calibratedLevel = "Beginner";
    recommendationReason = `Recent ratings indicate cognitive friction (${averageConfidence}/4 avg). Difficulty calibrated to Beginner to reinforce foundational mental models.`;
  } else {
    // Moderate: default to Intermediate if at least 1 challenge is solved with >=3 confidence
    calibratedLevel = "Intermediate";
    recommendationReason = `Balanced progress (${averageConfidence}/4 avg). Calibrated to Intermediate for steady scaffolding progression.`;
  }

  return {
    calibratedLevel,
    averageConfidence,
    totalRatings: total,
    consecutiveHigh,
    consecutiveLow,
    recommendationReason,
  };
}

export function getRecommendedChallenge(
  currentChallengeId: string,
  calibratedLevel: ChallengeDifficulty,
  history: ConfidenceRating[]
): Challenge {
  const completedIds = new Set(history.map((h) => h.challengeId));

  // Find an uncompleted challenge at the calibrated level
  const matches = SAMPLE_CHALLENGES.filter(
    (c) => c.difficulty === calibratedLevel && c.id !== currentChallengeId
  );

  const uncompletedMatch = matches.find((c) => !completedIds.has(c.id));
  if (uncompletedMatch) return uncompletedMatch;

  // If all at that level were completed or no match, pick any at that level
  if (matches.length > 0) return matches[0];

  // Fallback to any different challenge
  const fallback = SAMPLE_CHALLENGES.find((c) => c.id !== currentChallengeId);
  return fallback || SAMPLE_CHALLENGES[0];
}

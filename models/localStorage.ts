import { ChallengeSummary } from "./ChallengeSummary";

export interface LocalStorageDailyStats {
  streak: number;
  history: { [date: string]: LocalStorageChallengeSummary };
  todaysAttempt: ChallengeSummary;
}

export interface LocalStorageChallengeSummary {
  endTime: number; // unix time in milliseconds
  wpm: number; // whole number
  challengeDuration: number; // milliseconds
  accuracy: number; // in decimal
  averageRTT: number; // in milliseconds
}

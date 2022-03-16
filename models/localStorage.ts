import { ChallengeSummary } from "./ChallengeSummary";

export interface LocalStorageDailyStats {
  streak: number;
  history: {
    endTimes: number[];
    wpm: number[];
    challengeDuration: number[];
    accuracy: number[];
    rtt: number[];
  };
  summary?: ChallengeSummary;
}

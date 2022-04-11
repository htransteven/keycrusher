import { ChallengeSummary } from "../firestore/ChallengeSummary";

export interface DailyStats {
  streak: number;
  history: { [date: string]: ChallengeSummary };
}

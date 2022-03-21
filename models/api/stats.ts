export interface DailyStats {
  streak: number;
  history: { [date: string]: DailyStatsChallengeSummary };
}

export interface DailyStatsChallengeSummary {
  endTime: number; // unix time in milliseconds
  wpm: number; // whole number
  challengeDuration: number; // milliseconds
  accuracy: number; // in decimal
  averageRTT: number; // in milliseconds
}

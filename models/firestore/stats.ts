export interface DailyStats {
  streak: number;
  historyIds: string[];
}

export interface Stats {
  daily: DailyStats;
}

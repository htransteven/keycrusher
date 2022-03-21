import { DailyStatsChallengeSummary } from "../../models/api/stats";
import { ChallengeSummary } from "../../models/firestore/ChallengeSummary";

export const challengeSummaryToDailyChallengeSummary = (
  summary: ChallengeSummary
): DailyStatsChallengeSummary => {
  let sumRTT = 0;
  let sumRTTCount = 0;
  for (const wIndex in summary.telemetry.history) {
    for (const cIndex in summary.telemetry.history[wIndex]) {
      const keyTelemetry = summary.telemetry.history[wIndex][cIndex];
      if (keyTelemetry.rtt === 0) continue;

      sumRTT += keyTelemetry.rtt;
      sumRTTCount += 1;
    }
  }

  return {
    accuracy:
      summary.telemetry.numCorrect /
      (summary.telemetry.numCorrect + summary.telemetry.numErrors),
    averageRTT: sumRTT / sumRTTCount,
    challengeDuration: summary.challengeDuration,
    endTime: summary.time.unix.endTime,
    wpm: summary.wpm,
  };
};

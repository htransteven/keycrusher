import { Telemetry } from "../Telemetry";

export type ChallengeMode = "classic" | "daily";

export interface ChallengeTimeData {
  unix: {
    startTime: number; // milliseconds
    endTime: number; // milliseconds
  };
  performance: {
    startTime: number; // milliseconds
    endTime: number; // milliseconds
  };
}

export interface ChallengeSummary {
  mode: ChallengeMode;
  wpm: number;
  challengeDuration: number; // milliseconds
  telemetry: Telemetry;
  time: ChallengeTimeData;
  completedOnMobile: boolean;
}

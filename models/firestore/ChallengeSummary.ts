import { Telemetry } from "../Telemetry";

export type ChallengeMode = "default" | "daily";

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
  challengeDuration: number;
  telemetry: Telemetry;
  time: ChallengeTimeData;
}

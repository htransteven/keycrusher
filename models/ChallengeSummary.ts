import { Telemetry } from "./Telemetry";

export interface ChallengeSummary {
  wpm: number;
  duration: number;
  telemetry: Telemetry;
  completed: number;
}

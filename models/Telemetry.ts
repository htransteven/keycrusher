export interface KeyTelemetry {
  char: string;
  rtt: number;
  correct: boolean;
}

export interface Telemetry {
  numCorrect: number;
  numErrors: number;
  history: {
    [wordIndex: string | number]: {
      [charIndex: string | number]: KeyTelemetry;
    };
  };
}

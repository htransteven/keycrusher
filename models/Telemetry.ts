export interface WPMTelemtry {
  wpm: number;
  time: number;
}

export interface KeyTelemetry {
  char: string;
  responseTime: number;
  correct: boolean;
  time: number;
}

export interface RawTelemetry {
  numCorrect: number;
  numErrors: number;
  wpm: WPMTelemtry[];
  history: {
    [wordIndex: string | number]: {
      [charIndex: string | number]: KeyTelemetry;
    };
  };
}

export interface ResponseTimeMapHistoryEntry {
  responseTime: number;
  time: number;
}

export interface ResponseTimeMap {
  [char: string]: ResponseTimeMapEntry;
}

export interface ResponseTimeMapEntry {
  char: string;
  averageResponseTime: number;
  history: ResponseTimeMapHistoryEntry[];
}

export interface Telemetry extends RawTelemetry {
  accuracy: number;
  averageResponseTime: number;
  totals: {
    characters: number;
    words: number;
  };
  averageWPM: number;
  responseTimeMap: ResponseTimeMap;
}

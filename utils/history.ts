import { RawTelemetry, ResponseTimeMap, Telemetry } from "../models/Telemetry";

export const getTelemetryFromRawTelemetry = (
  telemetry: RawTelemetry
): Telemetry => {
  const responseTimeMap: ResponseTimeMap = {};

  const { history } = telemetry;

  let charsTyped = 0;
  let wordsTyped = 0;

  for (const wIndex in history) {
    let finish = false;
    for (const cIndex in history[wIndex]) {
      const keyTelemetry = history[wIndex][cIndex];
      if (keyTelemetry.time === -1) {
        finish = true;
        console.log("finishing at ", wIndex, cIndex);
        break;
      }

      if (!responseTimeMap[keyTelemetry.char]) {
        responseTimeMap[keyTelemetry.char] = {
          char: keyTelemetry.char,
          averageResponseTime: keyTelemetry.responseTime,
          history: [
            {
              responseTime: keyTelemetry.responseTime,
              time: keyTelemetry.time,
            },
          ],
        };
      } else {
        responseTimeMap[keyTelemetry.char].averageResponseTime =
          responseTimeMap[keyTelemetry.char].averageResponseTime +
          keyTelemetry.responseTime; // temporarily store as sum for average
        responseTimeMap[keyTelemetry.char].history.push({
          responseTime: keyTelemetry.responseTime,
          time: keyTelemetry.time,
        });
      }

      charsTyped++;
    }
    if (finish) {
      break;
    }
    wordsTyped++;
  }

  let overallSumResponseTime = 0;
  let overallSumUsage = 0;

  // calculate average response time
  Object.keys(responseTimeMap).forEach((key) => {
    overallSumResponseTime += responseTimeMap[key].averageResponseTime;
    overallSumUsage += responseTimeMap[key].history.length;
    responseTimeMap[key].averageResponseTime =
      responseTimeMap[key].averageResponseTime /
      responseTimeMap[key].history.length;
  });

  return {
    averageWPM:
      telemetry.wpm.reduce((sum, wpm) => sum + wpm.wpm, 0) /
      telemetry.wpm.length,
    averageResponseTime: overallSumResponseTime / overallSumUsage,
    accuracy: telemetry.numCorrect / charsTyped,
    totals: {
      characters: charsTyped,
      words: wordsTyped,
    },
    responseTimeMap,
    ...telemetry,
  };
};

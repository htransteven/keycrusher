import React from "react";
import styled, { useTheme } from "styled-components";
import { DailyStats } from "../models/api/stats";
import { BREAKPOINTS } from "../styles/breakpoints";
import { toFixed } from "../utils/numbers";
import StreakIcon from "../assets/fire-flame-curved-solid.svg";
import WPMIcon from "../assets/keyboard-solid.svg";
import AccuracyIcon from "../assets/crosshairs-solid.svg";
import ResponseTimeIcon from "../assets/stopwatch-solid.svg";
import DurationIcon from "../assets/hourglass-regular.svg";
import { Data, DataContainer, Title } from "./ChallengeSummary";
import { ChallengeSummary } from "../models/firestore/ChallengeSummary";

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: max-content;
  box-shadow: 0 4px 16px rgb(10 10 10 / 20%);
  border-radius: 8px;
  background-color: ${({ theme }) => theme.backgroundLayers.two};
  padding: 20px;
  gap: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    width: 100%;
  }
`;

interface AverageCalculations {
  sumWPM: number;
  countWPM: number;
  sumAccuracy: number;
  countAccuracy: number;
  sumRTT: number;
  countRTT: number;
  sumCD: number;
  countCD: number;
}

interface Averages {
  wpm: number;
  accuracy: number;
  rtt: number;
  challengeDuration: number;
}

interface SummaryArrayTransformed {
  wpm: number[];
  accuracy: number[];
  rtt: number[];
  challengeDuration: number[];
  endTime: number[];
}

export const DailyStatsSummary: React.FC<DailyStats> = ({
  streak,
  history,
}) => {
  const theme = useTheme();
  const averageCalculations: AverageCalculations = {
    sumWPM: 0,
    countWPM: 0,
    sumAccuracy: 0,
    countAccuracy: 0,
    sumRTT: 0,
    countRTT: 0,
    sumCD: 0,
    countCD: 0,
  };
  Object.keys(history).forEach((key) => {
    const summary = history[key] as ChallengeSummary;
    averageCalculations.sumWPM = averageCalculations.sumWPM + summary.wpm;
    averageCalculations.countWPM = averageCalculations.countWPM + 1;
    averageCalculations.sumAccuracy =
      averageCalculations.sumAccuracy + summary.telemetry.accuracy;
    averageCalculations.countAccuracy = averageCalculations.countAccuracy + 1;
    averageCalculations.sumRTT =
      averageCalculations.sumRTT + summary.telemetry.averageResponseTime;
    averageCalculations.countRTT = averageCalculations.countRTT + 1;
    averageCalculations.sumCD =
      averageCalculations.sumCD + summary.challengeDuration;
    averageCalculations.countCD = averageCalculations.countCD + 1;
  });

  const averages: Averages = {
    wpm: averageCalculations.sumWPM / averageCalculations.countWPM,
    accuracy:
      averageCalculations.sumAccuracy / averageCalculations.countAccuracy,
    rtt: averageCalculations.sumRTT / averageCalculations.countRTT,
    challengeDuration: averageCalculations.sumCD / averageCalculations.countCD,
  };

  return (
    <Container>
      <Title>Daily Challenge Stats</Title>
      {streak === 0 && <p>You need at least one completed daily challenge.</p>}
      {streak !== 0 && (
        <DataContainer>
          <Data
            label="Streak"
            value={`${streak}`}
            icon={<StreakIcon style={{ fill: theme.iconColors.streak }} />}
          />
          <Data
            label="Average WPM"
            value={`${toFixed(averages.wpm, 2)} wpm`}
            icon={<WPMIcon style={{ fill: theme.iconColors.wpm }} />}
          />
          <Data
            label="Average Accuracy"
            value={`${toFixed(averages.accuracy * 100, 2)}%`}
            icon={<AccuracyIcon style={{ fill: theme.iconColors.accuracy }} />}
          />
          <Data
            label="Average Response Time"
            value={`${toFixed(averages.rtt, 3)} ms`}
            icon={
              <ResponseTimeIcon
                style={{ fill: theme.iconColors.responseTime }}
              />
            }
          />
          <Data
            label="Average Duration"
            value={`${toFixed(averages.challengeDuration / 1000, 3)} s`}
            icon={<DurationIcon style={{ fill: theme.iconColors.duration }} />}
          />
        </DataContainer>
      )}
    </Container>
  );
};

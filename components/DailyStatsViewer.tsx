import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Label,
} from "recharts";
import styled, { useTheme } from "styled-components";
import { DailyStats } from "../models/api/stats";
import { BREAKPOINTS } from "../styles/breakpoints";
import { toFixed } from "../utils/numbers";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  margin: 25px 0;
`;

const Title = styled.h3`
  margin: 0;
`;

const DailyChallengeSummaryContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
`;

const GraphInfo = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
`;

const GraphHeader = styled.div`
  display: flex;
  align-items: center;
`;

const GraphTitle = styled.span`
  color: ${({ theme }) => theme.graphs.info.title.textColor};
  border-left: 5px solid ${({ theme }) => theme.graphs.info.title.accent};
  padding: 2px 0 2px 10px;
`;

const GraphDescription = styled.p`
  color: ${({ theme }) => theme.graphs.info.description.textColor};
`;

const GraphGrid = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: center;
  grid-gap: 10px;
`;

const GraphContainer = styled.div`
  width: calc(50% - 5px);
  padding: 25px;
  border-radius: 5px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.graphs.container.backgroundColor};
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.tablet}) {
    width: calc(100%);
  }
`;

const GraphWrapper = styled.div`
  min-height: 200px;
  height: 25vh;
  width: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: 15px;
  }
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 10px;
  }
`;

const DataContainer = styled.div`
  height: 100%;
  width: max-content;
  min-width: 125px;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px;
  gap: 5px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.challengeSummary.backgroundColor};
  border: 1px solid ${({ theme }) => theme.challengeSummary.borderColor};

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    flex: 1;
  }
`;
const DataLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.challengeSummary.labelColor};
`;
const DataValue = styled.span`
  font-size: 1.6rem;
  color: ${({ theme }) => theme.challengeSummary.valueColor};
`;

const Data: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <DataContainer>
      <DataLabel>{label}</DataLabel>
      <DataValue>{value}</DataValue>
    </DataContainer>
  );
};

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

export const DailyStatsViewer: React.FC<DailyStats> = ({ streak, history }) => {
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
  const data: SummaryArrayTransformed = Object.keys(history).reduce(
    (acc: SummaryArrayTransformed, curr) => {
      const summary = history[curr];
      averageCalculations.sumWPM = averageCalculations.sumWPM + summary.wpm;
      averageCalculations.countWPM = averageCalculations.countWPM + 1;
      averageCalculations.sumAccuracy =
        averageCalculations.sumAccuracy + summary.accuracy;
      averageCalculations.countAccuracy = averageCalculations.countAccuracy + 1;
      averageCalculations.sumRTT =
        averageCalculations.sumRTT + summary.averageRTT;
      averageCalculations.countRTT = averageCalculations.countRTT + 1;
      averageCalculations.sumCD =
        averageCalculations.sumCD + summary.challengeDuration;
      averageCalculations.countCD = averageCalculations.countCD + 1;

      return {
        wpm: [...acc.wpm, summary.wpm],
        accuracy: [...acc.accuracy, summary.accuracy],
        rtt: [...acc.rtt, summary.averageRTT],
        challengeDuration: [
          ...acc.challengeDuration,
          summary.challengeDuration,
        ],
        endTime: [...acc.endTime, summary.endTime],
      };
    },
    {
      wpm: [],
      accuracy: [],
      rtt: [],
      challengeDuration: [],
      endTime: [],
    }
  );
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
      <DailyChallengeSummaryContainer>
        <Data label={"Streak 🔥"} value={streak} />
        <Data label="Average WPM" value={`${toFixed(averages.wpm, 2)} wpm`} />
        <Data
          label="Average Accuracy"
          value={`${toFixed(averages.accuracy * 100, 2)}%`}
        />
        <Data label="Average RTT" value={`${toFixed(averages.rtt, 2)} ms`} />
        <Data
          label="Average Challenge Duration"
          value={`${toFixed(averages.challengeDuration / 1000, 3)} s`}
        />
      </DailyChallengeSummaryContainer>
      <GraphGrid>
        <GraphContainer>
          <GraphInfo>
            <GraphTitle>WPM vs. Time</GraphTitle>
          </GraphInfo>
          <GraphWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.wpm.map((wpm, index) => ({
                  wpm: toFixed(wpm, 2),
                  day: formatInTimeZone(
                    utcToZonedTime(data.endTime[index], "America/Los_Angeles"),
                    "America/Los_Angeles",
                    "MM-dd-yyyy"
                  ),
                }))}
                margin={{ top: 20, bottom: 0, left: 0, right: 20 }}
              >
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke={theme.graphs.data.active}
                  activeDot={{ r: 8 }}
                  unit={"wpm"}
                />
                <XAxis dataKey="day" stroke={theme.graphs.axis.color} />
                <YAxis dataKey="wpm" stroke={theme.graphs.axis.color} />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={averages.wpm}
                  label={
                    <Label
                      value={`Average WPM = ${averages.wpm.toFixed(2)} wpm`}
                      fill={theme.graphs.referenceLineColor}
                      position={"insideBottomRight"}
                      fontSize={"0.6rem"}
                    />
                  }
                  stroke={theme.graphs.referenceLineColor}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphWrapper>
        </GraphContainer>
        <GraphContainer>
          <GraphInfo>
            <GraphTitle>RTT vs. Time</GraphTitle>
          </GraphInfo>
          <GraphWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.rtt.map((rtt, index) => ({
                  rtt: toFixed(rtt, 2),
                  day: formatInTimeZone(
                    utcToZonedTime(data.endTime[index], "America/Los_Angeles"),
                    "America/Los_Angeles",
                    "MM-dd-yyyy"
                  ),
                }))}
                margin={{ top: 20, bottom: 0, left: 0, right: 20 }}
              >
                <Line
                  type="monotone"
                  dataKey="rtt"
                  stroke={theme.graphs.data.active}
                  activeDot={{ r: 8 }}
                  unit={"ms"}
                />
                <XAxis dataKey="day" stroke={theme.graphs.axis.color} />
                <YAxis
                  dataKey="rtt"
                  stroke={theme.graphs.axis.color}
                  unit={"ms"}
                />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={averages.rtt}
                  label={
                    <Label
                      value={`Average RTT = ${averages.rtt.toFixed(2)} ms`}
                      fill={theme.graphs.referenceLineColor}
                      position={"insideBottomRight"}
                      fontSize={"0.6rem"}
                    />
                  }
                  stroke={theme.graphs.referenceLineColor}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphWrapper>
        </GraphContainer>
        <GraphContainer>
          <GraphInfo>
            <GraphTitle>Accuracy vs. Time</GraphTitle>
          </GraphInfo>
          <GraphWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.accuracy.map((accuracy, index) => ({
                  accuracy: toFixed(accuracy * 100, 2),
                  day: formatInTimeZone(
                    utcToZonedTime(data.endTime[index], "America/Los_Angeles"),
                    "America/Los_Angeles",
                    "MM-dd-yyyy"
                  ),
                }))}
                margin={{ top: 20, bottom: 0, left: 0, right: 20 }}
              >
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke={theme.graphs.data.active}
                  activeDot={{ r: 8 }}
                  unit={"%"}
                />
                <XAxis dataKey="day" stroke={theme.graphs.axis.color} />
                <YAxis
                  dataKey="accuracy"
                  stroke={theme.graphs.axis.color}
                  unit={"%"}
                />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={toFixed(averages.accuracy * 100, 2)}
                  label={
                    <Label
                      value={`Average Accuracy = ${toFixed(
                        averages.accuracy * 100,
                        2
                      )}%`}
                      fill={theme.graphs.referenceLineColor}
                      position={"insideBottomRight"}
                      fontSize={"0.6rem"}
                    />
                  }
                  stroke={theme.graphs.referenceLineColor}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphWrapper>
        </GraphContainer>
        <GraphContainer>
          <GraphInfo>
            <GraphTitle>Challenge Duration vs. Time</GraphTitle>
          </GraphInfo>
          <GraphWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.challengeDuration.map(
                  (challengeDuration, index) => ({
                    challengeDuration: toFixed(challengeDuration / 1000, 3),
                    day: formatInTimeZone(
                      utcToZonedTime(
                        data.endTime[index],
                        "America/Los_Angeles"
                      ),
                      "America/Los_Angeles",
                      "MM-dd-yyyy"
                    ),
                  })
                )}
                margin={{ top: 20, bottom: 0, left: 0, right: 20 }}
              >
                <Line
                  type="monotone"
                  dataKey="challengeDuration"
                  stroke={theme.graphs.data.active}
                  activeDot={{ r: 8 }}
                  unit={"s"}
                />
                <XAxis dataKey="day" stroke={theme.graphs.axis.color} />
                <YAxis
                  dataKey="challengeDuration"
                  stroke={theme.graphs.axis.color}
                  unit={"s"}
                />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={toFixed(averages.challengeDuration / 1000, 3)}
                  label={
                    <Label
                      value={`Average Challenge Duration = ${toFixed(
                        averages.challengeDuration / 1000,
                        3
                      )} s`}
                      fill={theme.graphs.referenceLineColor}
                      position={"insideBottomRight"}
                      fontSize={"0.6rem"}
                    />
                  }
                  stroke={theme.graphs.referenceLineColor}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphWrapper>
        </GraphContainer>
      </GraphGrid>
    </Container>
  );
};

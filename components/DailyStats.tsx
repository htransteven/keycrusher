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
import { LocalStorageDailyStats } from "../models/localStorage";
import { BREAKPOINTS } from "../styles/breakpoints";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  margin: 10px 0;
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

export const DailyStats: React.FC<LocalStorageDailyStats> = ({
  streak,
  history,
}) => {
  const theme = useTheme();
  const averageAccuracy =
    history.accuracy.reduce((prev, curr) => prev + curr, 0) /
    history.accuracy.length;

  const averageWPM =
    history.wpm.reduce((prev, curr) => prev + curr, 0) / history.wpm.length;
  const averageRTT =
    history.rtt.reduce((prev, curr) => prev + curr, 0) / history.rtt.length;

  const averageChallengeDuration =
    history.challengeDuration.reduce((prev, curr) => prev + curr, 0) /
    history.challengeDuration.length;

  return (
    <Container>
      <DailyChallengeSummaryContainer>
        <Data label="Streak" value={streak} />
        <Data label="Average WPM" value={`${averageWPM.toFixed(0)} wpm`} />
        <Data label="Average RTT" value={`${averageRTT.toFixed(0)} ms`} />
        <Data
          label="Average Accuracy"
          value={`${(averageAccuracy * 100).toFixed(2)}%`}
        />
        <Data
          label="Average Challenge Duration"
          value={`${averageChallengeDuration.toFixed(2)} ms`}
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
                data={history.wpm.map((wpm, index) => ({
                  wpm,
                  day: formatInTimeZone(
                    utcToZonedTime(
                      history.endTimes[index],
                      "America/Los_Angeles"
                    ),
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
                  y={averageWPM}
                  label={
                    <Label
                      value={`Average WPM = ${averageWPM} wpm`}
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
                data={history.rtt.map((rtt, index) => ({
                  rtt,
                  day: formatInTimeZone(
                    utcToZonedTime(
                      history.endTimes[index],
                      "America/Los_Angeles"
                    ),
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
                <YAxis dataKey="rtt" stroke={theme.graphs.axis.color} />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={averageRTT}
                  label={
                    <Label
                      value={`Average RTT = ${averageRTT} ms`}
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
                data={history.accuracy.map((accuracy, index) => ({
                  accuracy,
                  day: formatInTimeZone(
                    utcToZonedTime(
                      history.endTimes[index],
                      "America/Los_Angeles"
                    ),
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
                <YAxis dataKey="accuracy" stroke={theme.graphs.axis.color} />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={averageAccuracy}
                  label={
                    <Label
                      value={`Average Accuracy = ${averageAccuracy}%`}
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
                data={history.challengeDuration.map(
                  (challengeDuration, index) => ({
                    challengeDuration: challengeDuration.toFixed(2),
                    day: formatInTimeZone(
                      utcToZonedTime(
                        history.endTimes[index],
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
                  unit={"ms"}
                />
                <XAxis dataKey="day" stroke={theme.graphs.axis.color} />
                <YAxis
                  dataKey="challengeDuration"
                  stroke={theme.graphs.axis.color}
                />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={averageChallengeDuration.toFixed(2)}
                  label={
                    <Label
                      value={`Average Challenge Duration = ${averageChallengeDuration.toFixed(
                        2
                      )} ms`}
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

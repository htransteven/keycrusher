import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Label,
} from "recharts";
import styled, { useTheme } from "styled-components";
import { ChallengeSummary as ChallengeSummaryProps } from "../models/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";
import { ChallengeSummary } from "./ChallengeSummary";
import HelpIcon from "../assets/circle-question-solid.svg";
import Tippy from "@tippyjs/react/headless";

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

const GraphInfo = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
`;
const HelpIconWrapper = styled.span`
  display: flex;
  align-items: center;
  padding: 5px;
  color: ${({ theme }) => theme.graphs.info.title.accent};
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

const GraphContainer = styled.div`
  width: 100%;
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

const TooltipArrow = styled.div`
  &,
  &::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
  }

  &::before {
    visibility: visible;
    content: "";
    transform: rotate(45deg);
    background-color: ${({ theme }) => theme.tooltip.borderColor};
  }
`;

const TooltipContainer = styled.div`
  max-width: 500px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;

  &[data-placement^="top"] > ${TooltipArrow} {
    bottom: -4px;
  }

  &[data-placement^="bottom"] > ${TooltipArrow} {
    top: -4px;
  }

  &[data-placement^="left"] > ${TooltipArrow} {
    right: -4px;
  }

  &[data-placement^="right"] > ${TooltipArrow} {
    left: -4px;
  }
`;

const TooltipContent = styled.div`
  font-size: 0.8rem;
  padding: 15px 15px;
  color: ${({ theme }) => theme.tooltip.textColor};
  background-color: ${({ theme }) => theme.tooltip.backgroundColor};
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.tooltip.borderColor};
`;

interface GraphData {
  [char: string]: {
    sumRTT: number;
    history: number[];
  };
}

interface SelectedKeyData {
  char: string;
  averageRTT: number;
}

export const PostChallengeStats: React.FC<ChallengeSummaryProps> = ({
  telemetry,
  ...summaryProps
}) => {
  const theme = useTheme();
  const [selectedKey, setSelectedKey] = useState<SelectedKeyData | null>(null);
  const dataMap: GraphData = {};

  const { history } = telemetry;

  for (const wIndex in history) {
    for (const cIndex in history[wIndex]) {
      const keyTelemetry = history[wIndex][cIndex];
      if (keyTelemetry.rtt === 0) continue;

      if (!dataMap[keyTelemetry.char]) {
        dataMap[keyTelemetry.char] = {
          sumRTT: keyTelemetry.rtt,
          history: [keyTelemetry.rtt],
        };
      } else {
        dataMap[keyTelemetry.char].history.push(keyTelemetry.rtt);
        dataMap[keyTelemetry.char].sumRTT += keyTelemetry.rtt;
      }
    }
  }

  let overallSumRTT = 0;
  let overallSumUsage = 0;

  const data = Object.keys(dataMap)
    .map((char) => {
      overallSumRTT += dataMap[char].sumRTT;
      overallSumUsage += dataMap[char].history.length;
      return {
        char,
        averageRTT: dataMap[char].sumRTT / dataMap[char].history.length,
      };
    })
    .sort((a, b) => (a.char > b.char ? 1 : -1));

  const selectedKeyData = selectedKey
    ? dataMap[selectedKey.char].history.map((rtt, index) => ({
        rtt,
        timestamp: index,
      }))
    : [];

  return (
    <Container>
      <Title>Previous Challenge Summary</Title>
      <ChallengeSummary telemetry={telemetry} {...summaryProps} />
      <GraphContainer>
        <GraphInfo>
          <GraphHeader>
            <GraphTitle>Average RTT vs. Key</GraphTitle>
            <Tippy
              interactive={true}
              render={(attrs) => (
                <TooltipContainer {...attrs}>
                  <TooltipContent>
                    Average Read-to-Type/Text Time (RTT) is the measurement from
                    when you begin processing the next character to type and
                    when you actually press the key. For example, if you were
                    typing the word {`\"`}crusher{`\"`} and have already typed{" "}
                    {`\"`}cr{`\"`}, the RTT would be the time between typing{" "}
                    {`\'`}r {`\'`} and typing {`\'`}u {`\'`}.
                  </TooltipContent>
                  <TooltipArrow data-popper-arrow="" />
                </TooltipContainer>
              )}
            >
              <HelpIconWrapper>
                <HelpIcon
                  style={{
                    height: "0.8rem",
                    width: "0.8rem",
                  }}
                />
              </HelpIconWrapper>
            </Tippy>
          </GraphHeader>
          <GraphDescription>
            This graph shows the Average RTT for each key used in this
            challenge.
          </GraphDescription>
          <GraphDescription style={{ color: theme.graphs.info.title.accent }}>
            Click on a bar to see more data.
          </GraphDescription>
        </GraphInfo>
        <GraphWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, bottom: 0, left: 0, right: 20 }}
            >
              <Bar
                dataKey="averageRTT"
                onClick={(data) =>
                  setSelectedKey({
                    char: data.char,
                    averageRTT: data.averageRTT,
                  })
                }
                radius={[2, 2, 0, 0]}
              >
                {data.map((charTelemetry, index) => (
                  <Cell
                    key={`telemetry-graph-avgRTT-key-${charTelemetry.char}-${index}`}
                    cursor="pointer"
                    fill={
                      charTelemetry.char === selectedKey?.char
                        ? theme.graphs.data.active
                        : theme.graphs.data.default
                    }
                  />
                ))}
              </Bar>
              <XAxis dataKey="char" stroke={theme.graphs.axis.color} />
              <YAxis
                dataKey="averageRTT"
                stroke={theme.graphs.axis.color}
                unit={"ms"}
              />
              <ReferenceLine
                isFront={true}
                y={overallSumRTT / overallSumUsage}
                label={
                  <Label
                    value={`Average RTT = ${(
                      overallSumRTT / overallSumUsage
                    ).toFixed(0)} ms`}
                    fill={theme.graphs.referenceLineColor}
                    position={"insideBottomRight"}
                    fontSize={"0.6rem"}
                  />
                }
                stroke={theme.graphs.referenceLineColor}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </GraphWrapper>
      </GraphContainer>
      {selectedKey && (
        <GraphContainer>
          <GraphInfo>
            <GraphTitle>RTT vs. Key Usage Instance</GraphTitle>
            <GraphDescription>
              This graph shows the RTT for each time you typed this key.
            </GraphDescription>
          </GraphInfo>
          <GraphWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={selectedKeyData}
                margin={{ top: 20, bottom: 0, left: 0, right: 20 }}
              >
                <Line
                  type="monotone"
                  dataKey="rtt"
                  stroke={theme.graphs.data.active}
                  activeDot={{ r: 8 }}
                  unit={"ms"}
                />
                <XAxis dataKey="timestamp" stroke={theme.graphs.axis.color} />
                <YAxis
                  dataKey="rtt"
                  stroke={theme.graphs.axis.color}
                  unit={"ms"}
                />
                <Tooltip />
                <ReferenceLine
                  isFront={true}
                  y={selectedKey.averageRTT}
                  label={
                    <Label
                      value={`Average RTT for key ${
                        selectedKey.char
                      } = ${selectedKey.averageRTT.toFixed(0)}ms`}
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
      )}
    </Container>
  );
};

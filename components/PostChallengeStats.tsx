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
import { Telemetry } from "../models/Telemetry";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  margin: 10px 0;
`;

const GraphWrapper = styled.div`
  border-radius: 5px;
  padding: 20px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.graphs.container.backgroundColor};
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

export const PostChallengeStats: React.FC<Telemetry> = ({ history }) => {
  const theme = useTheme();
  const [selectedKey, setSelectedKey] = useState<SelectedKeyData | null>(null);
  const dataMap: GraphData = {};

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

  console.log(data);

  return (
    <Container>
      <GraphWrapper>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
          >
            <XAxis dataKey="char" stroke={theme.graphs.axis.color}>
              <Label
                position="bottom"
                style={{ textAnchor: "middle" }}
                fill={theme.graphs.axis.color}
                fontSize={"0.8rem"}
              >
                Character
              </Label>
            </XAxis>
            <YAxis
              dataKey="averageRTT"
              stroke={theme.graphs.axis.color}
              unit={"ms"}
            >
              <Label
                angle={270}
                position="left"
                offset={20}
                style={{ textAnchor: "middle" }}
                fill={theme.graphs.axis.color}
                fontSize={"0.8rem"}
              >
                Average RTT (ms)
              </Label>
            </YAxis>
            <Bar
              dataKey="averageRTT"
              onClick={(data) =>
                setSelectedKey({ char: data.char, averageRTT: data.averageRTT })
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
            <ReferenceLine
              isFront={true}
              y={overallSumRTT / overallSumUsage}
              label={
                <Label
                  value={`Average RTT`}
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
      {selectedKey && (
        <GraphWrapper>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={selectedKeyData}
              margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
            >
              <XAxis dataKey="timestamp" stroke={theme.graphs.axis.color}>
                <Label
                  position="bottom"
                  style={{ textAnchor: "middle" }}
                  fill={theme.graphs.axis.color}
                  fontSize={"0.8rem"}
                >
                  Instance
                </Label>
              </XAxis>
              <YAxis dataKey="rtt" stroke={theme.graphs.axis.color} unit={"ms"}>
                <Label
                  angle={270}
                  position="left"
                  offset={20}
                  style={{ textAnchor: "middle" }}
                  fill={theme.graphs.axis.color}
                  fontSize={"0.8rem"}
                >
                  RTT Time (ms)
                </Label>
              </YAxis>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rtt"
                stroke={theme.textPrompt.correct}
                activeDot={{ r: 8 }}
              />
              <ReferenceLine
                isFront={true}
                y={selectedKey.averageRTT}
                label={
                  <Label
                    value={`Average RTT for key ${selectedKey.char}`}
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
      )}
    </Container>
  );
};
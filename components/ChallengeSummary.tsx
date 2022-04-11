import React from "react";
import styled, { useTheme } from "styled-components";
import { ChallengeSummary as ChallengeSummaryProps } from "../models/firestore/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";
import { toFixed } from "../utils/numbers";
import WPMIcon from "../assets/keyboard-solid.svg";
import AccuracyIcon from "../assets/crosshairs-solid.svg";
import MistakesIcon from "../assets/spell-check-solid.svg";
import DurationIcon from "../assets/hourglass-regular.svg";
import ResponseTimeIcon from "../assets/stopwatch-solid.svg";

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

const Title = styled.h3`
  width: 100%;
  margin: 0;
`;

const DataContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const DataWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  border-radius: 3px;
  padding: 5px 0;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    flex: 1;
  }
`;

const DataLabel = styled.span`
  display: flex;
  flex-flow: row nowrap;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.tertiaryTextColor};
  white-space: nowrap;
  align-items: center;
  gap: 10px;
`;
const DataValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.primaryTextColor};
  white-space: nowrap;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primaryTextColor};
  font-size: 1.2rem;
`;

export const Data: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <DataWrapper>
      <DataLabel>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        {label}
      </DataLabel>
      <DataValue>{value}</DataValue>
    </DataWrapper>
  );
};

export const ChallengeSummary: React.FC<ChallengeSummaryProps> = ({
  mode,
  wpm,
  challengeDuration,
  telemetry,
  time,
}) => {
  const theme = useTheme();
  const { numCorrect, numErrors } = telemetry;
  return (
    <Container>
      <Title>Summary</Title>
      <DataContainer>
        <Data
          label="WPM"
          value={`${toFixed(wpm, 2)} wpm`}
          icon={<WPMIcon style={{ fill: theme.iconColors.wpm }} />}
        />
        <Data
          label="Accuracy"
          value={`${toFixed(
            (numCorrect / (numCorrect + numErrors)) * 100,
            2
          )}%`}
          icon={<AccuracyIcon style={{ fill: theme.iconColors.accuracy }} />}
        />
        <Data
          label="Correctness"
          value={`${numCorrect} / ${numErrors}`}
          icon={<MistakesIcon style={{ fill: theme.iconColors.correctness }} />}
        />
        <Data
          label="Average Response Time"
          value={`${toFixed(telemetry.averageResponseTime, 3)} ms`}
          icon={
            <ResponseTimeIcon style={{ fill: theme.iconColors.responseTime }} />
          }
        />
        <Data
          label="Duration"
          value={
            mode === "classic"
              ? `${toFixed(challengeDuration / 1000, 3)}s`
              : `${toFixed(
                  (time.performance.endTime - time.performance.startTime) /
                    1000,
                  3
                )} s`
          }
          icon={<DurationIcon style={{ fill: theme.iconColors.duration }} />}
        />
      </DataContainer>
    </Container>
  );
};

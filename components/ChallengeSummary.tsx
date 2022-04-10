import React from "react";
import styled from "styled-components";
import { ChallengeSummary as ChallengeSummaryProps } from "../models/firestore/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";
import { toFixed } from "../utils/numbers";

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
`;

const DataContainer = styled.div`
  position: relative;
  height: 100%;
  width: max-content;
  min-width: 125px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  padding: 10px 30px;
  gap: 5px;
  //border-radius: 5px;
  //background-color: ${({ theme }) => theme.challengeSummary.backgroundColor};
  //border: 1px solid ${({ theme }) => theme.challengeSummary.borderColor};

  &::before {
    content: "";
    background-color: ${({ theme }) => theme.dividers.color};
    position: absolute;
    top: 50%;
    left: 0;
    height: 110%;
    transform: translateY(-50%);
    width: 1px;
  }

  &:first-of-type {
    &::before {
      width: 0;
    }
  }

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

export const ChallengeSummary: React.FC<ChallengeSummaryProps> = ({
  mode,
  wpm,
  challengeDuration,
  telemetry,
  time,
}) => {
  const { numCorrect, numErrors } = telemetry;
  return (
    <Container>
      <Data label="WPM" value={`${toFixed(wpm, 2)} wpm`} />
      <Data
        label="Accuracy"
        value={`${toFixed((numCorrect / (numCorrect + numErrors)) * 100, 2)}%`}
      />
      <Data label="Mistakes" value={numErrors} />
      <Data
        label="Words Typed"
        value={toFixed((numCorrect + numErrors) / 5, 2)}
      />
      <Data
        label="Duration"
        value={
          mode === "classic"
            ? `${toFixed(challengeDuration / 1000, 3)}s`
            : `${toFixed(
                (time.performance.endTime - time.performance.startTime) / 1000,
                3
              )} s`
        }
      />
    </Container>
  );
};

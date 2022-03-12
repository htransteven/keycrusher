import React from "react";
import styled from "styled-components";
import { ChallengeSummary as ChallengeSummaryProps } from "../models/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
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

export const ChallengeSummary: React.FC<ChallengeSummaryProps> = ({
  wpm,
  duration,
  telemetry,
}) => {
  const { numCorrect, numErrors } = telemetry;
  return (
    <Container>
      <Data label="WPM" value={`${wpm.toFixed(0)}`} />
      <Data
        label="Accuracy"
        value={`${((numCorrect / (numCorrect + numErrors)) * 100).toFixed(2)}%`}
      />
      <Data label="Mistakes" value={numErrors} />
      <Data label="Challenge Duration" value={`${duration}s`} />
    </Container>
  );
};
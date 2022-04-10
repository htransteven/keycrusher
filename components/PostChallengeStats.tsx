import React, { useState } from "react";
import styled from "styled-components";
import { ChallengeSummary as ChallengeSummaryProps } from "../models/firestore/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";
import { ChallengeSummary } from "./ChallengeSummary";
import { ResponseVsKeyChart } from "./charts/ResponseVsKeyChart";
import { ResponseVsKeyUsageTime } from "./charts/ResponseVsKeyUsageTime";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
`;
const Title = styled.h2`
  margin: 0;
  text-align: center;
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

export const PostChallengeStats: React.FC<ChallengeSummaryProps> = ({
  telemetry,
  ...summaryProps
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(
    Object.keys(telemetry.responseTimeMap)[0]
  );

  console.log(telemetry);

  return (
    <Container>
      <Title>Results</Title>
      <ChallengeSummary telemetry={telemetry} {...summaryProps} />
      <GraphContainer>
        <ResponseVsKeyChart
          telemetry={telemetry}
          selectedKey={selectedKey}
          onSelect={(key) => setSelectedKey(key)}
        />
        <ResponseVsKeyUsageTime
          {...telemetry.responseTimeMap[selectedKey]}
          duration={summaryProps.challengeDuration}
        />
      </GraphContainer>
    </Container>
  );
};

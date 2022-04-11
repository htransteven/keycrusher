import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavHeight } from "../contexts/NavHeightContext";
import { DailyStats } from "../models/api/stats";
import { ChallengeSummary as ChallengeSummaryProps } from "../models/firestore/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";
import { ChallengeSummary } from "./ChallengeSummary";
import { ResponseVsKeyChart } from "./charts/ResponseVsKeyChart";
import { ResponseVsKeyUsageTimeChart } from "./charts/ResponseVsKeyUsageTimeChart";
import { WPMVsTimeChart } from "./charts/WPMVsTimeChart";
import { DailyStatsSummary } from "./DailyStatsSummary";

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    display: flex;
    flex-flow: column;
    gap: 10;
  }
`;

const LeftContainer = styled.div<{ navHeight: number }>`
  position: sticky;
  top: ${({ navHeight }) => `calc(${navHeight}px + 10px)`};
  width: 100%;
  display: flex;
  flex-flow: column;
  gap: 10px;
  height: max-content;
  width: max-content;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    position: static;
    width: 100%;
  }
`;

const GraphContainer = styled.div`
  padding: 25px;
  border-radius: 8px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.backgroundLayers.two};
  display: flex;
  flex-flow: column;
  min-width: 0;
  gap: 20px;
`;

const GraphWrapper = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
`;

export const PostChallengeStats: React.FC<{
  challengeSummary?: ChallengeSummaryProps | null;
  dailyStats?: DailyStats | null;
}> = ({ challengeSummary, dailyStats }) => {
  const navHeight = useNavHeight();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (challengeSummary && !selectedKey) {
      setSelectedKey(
        Object.keys(challengeSummary.telemetry.responseTimeMap)[0]
      );
    }
  }, [challengeSummary, selectedKey]);

  return (
    <Container>
      <LeftContainer navHeight={navHeight}>
        {challengeSummary && <ChallengeSummary {...challengeSummary} />}
        {dailyStats && <DailyStatsSummary {...dailyStats} />}
      </LeftContainer>
      {challengeSummary && (
        <GraphContainer>
          <GraphWrapper>
            <WPMVsTimeChart
              telemetry={challengeSummary.telemetry}
              duration={challengeSummary.challengeDuration}
            />
          </GraphWrapper>
          <GraphWrapper>
            <ResponseVsKeyChart
              telemetry={challengeSummary.telemetry}
              selectedKey={selectedKey}
              onSelect={(key) => setSelectedKey(key)}
            />
          </GraphWrapper>
          {selectedKey && (
            <GraphWrapper>
              <ResponseVsKeyUsageTimeChart
                {...challengeSummary.telemetry.responseTimeMap[selectedKey]}
                duration={challengeSummary.challengeDuration}
              />
            </GraphWrapper>
          )}
        </GraphContainer>
      )}
    </Container>
  );
};

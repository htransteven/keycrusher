import styled, { useTheme } from "styled-components";
import { DailyStatsChallengeSummary } from "../../models/api/stats";
import { DailyChallenge } from "../../models/firestore/DailyChallenge";
import { BREAKPOINTS } from "../../styles/breakpoints";
import { toFixed } from "../../utils/numbers";

const Container = styled.div`
  border-radius: 3px;
  padding: 20px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.generic.container.backgroundColor};
  border: 1px solid ${({ theme }) => theme.greenAccent};
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 25px 0;
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 10px;
  }
`;

const Title = styled.span`
  font-weight: 500;
`;

const StatsGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
`;

const StatsGridRowLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`;
const StatsGridRowValue = styled.span`
  font-size: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.generic.grid.borderColor};

  transition: 0.15s background-color;

  &:first-of-type {
    border-radius: 3px 0 0 3px;
  }

  &:last-of-type {
    border-radius: 0 3px 3px 0;
  }
`;

const StatsGridRow = styled.div`
  display: contents;

  & > * {
    padding: 10px;
  }

  &:nth-of-type(2) {
    & > * {
      border-top: 1px solid ${({ theme }) => theme.generic.grid.borderColor};
    }
  }

  &:hover > ${StatsGridRowValue} {
    background-color: ${({ theme }) =>
      theme.generic.grid.row.hover.backgroundColor};
  }
`;

const DifferenceValue: React.FC<{
  value: number;
  unit: string;
  inversePositivity?: boolean;
}> = ({ value, unit, inversePositivity }) => {
  const theme = useTheme();
  return (
    <StatsGridRowValue
      style={{
        color: inversePositivity
          ? value <= 0
            ? theme.greenAccent
            : theme.redAccent
          : value >= 0
          ? theme.greenAccent
          : theme.redAccent,
      }}
    >
      {value >= 0 ? "▲" : "▼"} {value}
      {unit !== "%" && " "}
      {unit}
    </StatsGridRowValue>
  );
};

interface GlobalComparisonProps {
  summary: DailyStatsChallengeSummary;
  dailyChallenge: DailyChallenge;
}

export const GlobalStatsComparison: React.FC<GlobalComparisonProps> = ({
  summary,
  dailyChallenge,
}) => {
  return (
    <Container>
      <StatsGrid>
        <StatsGridRow>
          <Title>Global Comparison 🌎</Title>
          <StatsGridRowLabel>You</StatsGridRowLabel>
          <StatsGridRowLabel>Global Avg.</StatsGridRowLabel>
          <StatsGridRowLabel>Difference</StatsGridRowLabel>
        </StatsGridRow>
        <StatsGridRow>
          <StatsGridRowValue>WPM</StatsGridRowValue>
          <StatsGridRowValue>{toFixed(summary.wpm, 2)} wpm</StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(
              (dailyChallenge.sumWPM - summary.wpm) /
                (dailyChallenge.attempts - 1),
              2
            )}{" "}
            wpm
          </StatsGridRowValue>
          <DifferenceValue
            value={toFixed(
              summary.wpm -
                (dailyChallenge.sumWPM - summary.wpm) /
                  (dailyChallenge.attempts - 1),
              2
            )}
            unit={"wpm"}
          />
        </StatsGridRow>
        <StatsGridRow>
          <StatsGridRowValue>Accuracy</StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(summary.accuracy * 100, 2)}%
          </StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(
              ((dailyChallenge.sumAccuracy - summary.accuracy) /
                (dailyChallenge.attempts - 1)) *
                100,
              2
            )}
            %
          </StatsGridRowValue>
          <DifferenceValue
            value={toFixed(
              (summary.accuracy -
                (dailyChallenge.sumAccuracy - summary.accuracy) /
                  (dailyChallenge.attempts - 1)) *
                100,
              2
            )}
            unit={"%"}
          />
        </StatsGridRow>
        <StatsGridRow>
          <StatsGridRowValue>Challenge Duration</StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(summary.challengeDuration / 1000, 3)} s
          </StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(
              (dailyChallenge.sumTime - summary.challengeDuration) /
                (dailyChallenge.attempts - 1) /
                1000,
              3
            )}{" "}
            s
          </StatsGridRowValue>
          <DifferenceValue
            value={toFixed(
              (summary.challengeDuration -
                (dailyChallenge.sumTime - summary.challengeDuration) /
                  (dailyChallenge.attempts - 1)) /
                1000,
              3
            )}
            unit={"s"}
            inversePositivity={true}
          />
        </StatsGridRow>
      </StatsGrid>
    </Container>
  );
};

import styled, { useTheme } from "styled-components";
import { ChallengeSummary } from "../../models/firestore/ChallengeSummary";
import { DailyChallenge } from "../../models/firestore/DailyChallenge";
import { toFixed } from "../../utils/numbers";
import ArrowUpIcon from "../../assets/arrow-up-solid.svg";
import ArrowDownIcon from "../../assets/arrow-down-solid.svg";
import GlobeIcon from "../../assets/earth-americas-solid.svg";

const Container = styled.div`
  box-shadow: 0 4px 16px rgb(10 10 10 / 20%);
  border-radius: 8px;
  background-color: ${({ theme }) => theme.backgroundLayers.two};
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primaryTextColor};
  font-size: 1rem;
`;

const Title = styled.h3`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
  font-weight: 500;
  margin: 0;
`;

const StatsGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
`;

const StatsGridRowLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.tertiaryTextColor};
`;

const StatsGridRowValue = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.primaryTextColor};

  transition: 0.15s background-color;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatsGridRow = styled.div`
  display: contents;

  & > * {
    padding: 10px 20px;

    &:first-child,
    &:last-child {
      padding: 10px 10px;
    }

    &:first-child {
      border-radius: 5px 0 0 5px;
    }

    &:last-child {
      border-radius: 0 5px 5px 0;
    }
  }

  &:hover > ${StatsGridRowValue} {
    background-color: ${({ theme }) => theme.backgroundLayers.three};
  }
`;

const DifferenceValue: React.FC<{
  value: number;
  unit: string;
  inversePositivity?: boolean;
}> = ({ value, unit, inversePositivity }) => {
  const theme = useTheme();

  const color = inversePositivity
    ? value <= 0
      ? theme.green
      : theme.red
    : value >= 0
    ? theme.green
    : theme.red;

  return (
    <StatsGridRowValue
      style={{
        color,
      }}
    >
      {value >= 0 ? (
        <IconWrapper>
          <ArrowUpIcon
            style={{
              fill: color,
            }}
          />
        </IconWrapper>
      ) : (
        <IconWrapper>
          <ArrowDownIcon
            style={{
              fill: color,
            }}
          />
        </IconWrapper>
      )}{" "}
      {value}
      {unit !== "%" && " "}
      {unit}
    </StatsGridRowValue>
  );
};

interface GlobalComparisonProps {
  summary: ChallengeSummary;
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
          <Title>
            <IconWrapper>
              <GlobeIcon />
            </IconWrapper>
            Global Average Comparison
          </Title>
          <StatsGridRowLabel>You</StatsGridRowLabel>
          <StatsGridRowLabel>Global</StatsGridRowLabel>
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
            {toFixed(summary.telemetry.accuracy * 100, 2)}%
          </StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(
              (dailyChallenge.sumAccuracy / dailyChallenge.attempts) * 100,
              2
            )}
            %
          </StatsGridRowValue>
          <DifferenceValue
            value={toFixed(
              (summary.telemetry.accuracy -
                dailyChallenge.sumAccuracy / dailyChallenge.attempts) *
                100,
              2
            )}
            unit={"%"}
          />
        </StatsGridRow>
        <StatsGridRow>
          <StatsGridRowValue>Duration</StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(summary.challengeDuration / 1000, 3)} s
          </StatsGridRowValue>
          <StatsGridRowValue>
            {toFixed(
              dailyChallenge.sumTime / dailyChallenge.attempts / 1000,
              3
            )}{" "}
            s
          </StatsGridRowValue>
          <DifferenceValue
            value={toFixed(
              (summary.challengeDuration -
                dailyChallenge.sumTime / dailyChallenge.attempts) /
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

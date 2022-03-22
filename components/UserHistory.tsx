import { format } from "date-fns";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useFirebase } from "../contexts/FirebaseContext";
import { ChallengeSummary } from "../models/firestore/ChallengeSummary";
import { BREAKPOINTS } from "../styles/breakpoints";
import { toFixed } from "../utils/numbers";
import { Loading } from "./Loading";

const Container = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
`;

const Title = styled.span`
  font-size: 1.35rem;
`;

const HistoryEntry = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 10px 50px;
  padding: 20px;
  border-radius: 5px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.profile.history.backgroundColor};

  transition: 0.35s all;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) =>
      theme.profile.history.hover.backgroundColor};
  }
`;

const HistoryEntryLeft = styled.div`
  display: flex;
  flex-flow: column;
  gap: 10px;
`;

const HistoryEntryRight = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
`;

const DataContainer = styled.div`
  height: 100%;
  width: max-content;
  min-width: 100px;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 5px;

  @media only screen and (max-width: ${BREAKPOINTS.tablet}) {
    min-width: 80px;
  }
`;
const DataLabel = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.profile.history.secondaryTextColor};
`;
const DataValue = styled.span`
  font-size: 1.35rem;
  color: ${({ theme }) => theme.profile.history.textColor};
`;
const Data: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => {
  return (
    <DataContainer>
      <DataLabel>{label}</DataLabel>
      <DataValue>{value}</DataValue>
    </DataContainer>
  );
};

export const UserHistory = () => {
  const { firestore, firebaseUser } = useFirebase();
  const [history, setHistory] = useState<ChallengeSummary[] | null>(null);

  useEffect(() => {
    if (!firestore || !firebaseUser) return;

    getDocs(
      query(
        collection(firestore, `stats/${firebaseUser.uid}/history`),
        orderBy("time.unix.endTime", "desc")
      )
    ).then((docs) => {
      const data: ChallengeSummary[] = [];
      docs.forEach((doc) => data.push(doc.data() as ChallengeSummary));
      setHistory(data);
    });
  }, [firebaseUser, firestore]);

  return (
    <Container>
      <Title>History</Title>
      {!history && <Loading value="LOADING HISTORY" />}
      {history &&
        history.map((summary) => (
          <HistoryEntry key={summary.time.unix.endTime}>
            <HistoryEntryLeft>
              <Data
                label={format(
                  summary.time.unix.endTime,
                  "MMM d, yyyy hh:mm:ss a"
                )}
                value={`${toFixed(summary.wpm, 2)} WPM`}
              />
            </HistoryEntryLeft>
            <HistoryEntryRight>
              <Data
                label="Accuracy"
                value={`${(
                  (summary.telemetry.numCorrect /
                    (summary.telemetry.numCorrect +
                      summary.telemetry.numErrors)) *
                  100
                ).toFixed(2)}%`}
              />
              <Data label="Mistakes" value={summary.telemetry.numErrors} />
              {summary.mode === "daily" ? (
                <Data
                  label="Challenge Duration"
                  value={`${(summary.challengeDuration / 1000).toFixed(2)}s`}
                />
              ) : (
                <Data
                  label="Challenge Duration"
                  value={`${summary.challengeDuration}s`}
                />
              )}
            </HistoryEntryRight>
          </HistoryEntry>
        ))}
    </Container>
  );
};

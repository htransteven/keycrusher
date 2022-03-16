import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { doc, setDoc } from "firebase/firestore";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { PostChallengeStats } from "../components/PostChallengeStats";
import { Teleprompter } from "../components/Teleprompter";
import { useFirebase } from "../contexts/FirebaseContext";
import { ChallengeSummary } from "../models/ChallengeSummary";

const Container = styled.div``;

const HomePage: NextPage = () => {
  const { firestore, firebaseUser } = useFirebase();
  const [challengeSummary, setChallengeSummary] =
    useState<ChallengeSummary | null>(null);

  const getMoreWords = useCallback(async (wordCount: number) => {
    const query = new URLSearchParams();
    query.append("count", `${wordCount}`);

    const res = await fetch(`/api/words?${query.toString()}`);

    if (!res.ok) {
      console.log("failed to get more words");
      return null;
    }

    return (await res.json()) as string[];
  }, []);

  const onComplete = useCallback(
    async (summary: ChallengeSummary) => {
      setChallengeSummary(summary);

      if (!firebaseUser) return;
      const docId = formatInTimeZone(
        utcToZonedTime(Date.now(), "America/Los_Angeles"),
        "America/Los_Angeles",
        "MM-dd-yyyy_hh:mm:ss:SSS_a"
      );

      try {
        await setDoc(
          doc(firestore, `stats/${firebaseUser.uid}/history`, `${docId}`),
          summary
        );
      } catch (error) {
        alert("failed to save challenge");
        console.log(error);
      }
    },
    [firebaseUser, firestore]
  );

  const onReset = useCallback(() => {
    setChallengeSummary(null);
  }, []);

  return (
    <>
      <Head>
        <title>Key Crusher</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Teleprompter
          onMoreWords={getMoreWords}
          onComplete={onComplete}
          onReset={onReset}
        />
        {challengeSummary && <PostChallengeStats {...challengeSummary} />}
      </Container>
    </>
  );
};

export default HomePage;

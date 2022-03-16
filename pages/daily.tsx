import { format } from "date-fns";
import { getDoc, doc } from "firebase/firestore";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { PostChallengeStats } from "../components/PostChallengeStats";
import { Teleprompter } from "../components/Teleprompter";
import { useFirebase } from "../contexts/FirebaseContext";
import { ChallengeSummary } from "../models/ChallengeSummary";
import { DailyChallenge } from "../models/DailyChallenge";

const Container = styled.div``;

const HomePage: NextPage = () => {
  const { firestore } = useFirebase();
  const [challengeSummary, setChallengeSummary] =
    useState<ChallengeSummary | null>(null);

  const getDailyChallengeWords = useCallback(async () => {
    try {
      const dailyChallengeDoc = await getDoc(
        doc(firestore, "daily", format(Date.now(), "MM-dd-yyyy"))
      );

      if (!dailyChallengeDoc.exists()) {
        alert("daily challenge doc does not exist");
        return null;
      }

      // randomize order
      const dailyChallange = dailyChallengeDoc.data() as DailyChallenge;
      const newWords = dailyChallange.text.split(" ");
      for (let i = newWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newWords[i], newWords[j]] = [newWords[j], newWords[i]];
      }
      return newWords;
    } catch (error) {
      console.log(error);
    }
    return null;
  }, [firestore]);

  const onComplete = useCallback((cs: ChallengeSummary) => {
    setChallengeSummary(cs);
  }, []);

  const onReset = useCallback(() => {
    setChallengeSummary(null);
  }, []);

  return (
    <>
      <Head>
        <title>Key Crusher | Daily Challenge</title>
        <meta
          name="description"
          content="The daily typing challenge for Key Crusher."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Teleprompter
          mode={"daily"}
          coverText={"Daily Challenge"}
          onMoreWords={getDailyChallengeWords}
          onComplete={onComplete}
          onReset={onReset}
        />
        {challengeSummary && <PostChallengeStats {...challengeSummary} />}
      </Container>
    </>
  );
};

export default HomePage;

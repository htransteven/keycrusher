import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { PaddedContainer } from "../../components/layout/Containers";
import { PostChallengeStats } from "../../components/PostChallengeStats";
import { Teleprompter } from "../../components/Teleprompter";
import { useFirebase } from "../../contexts/FirebaseContext";
import { ChallengeSummary } from "../../models/firestore/ChallengeSummary";

const ClassicTestPage: NextPage = () => {
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
      if (challengeSummary) return;
      setChallengeSummary(summary);

      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: firebaseUser
          ? { authorization: `Bearer ${firebaseUser.uid}` }
          : undefined,
        body: JSON.stringify(summary),
      });
      if (!res.ok) {
        console.log(await res.json());
        alert("failed to upload challenge");
      }
    },
    [challengeSummary, firebaseUser]
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
      <PaddedContainer includeNavPadding={true} paddingSize={"more"}>
        <Teleprompter
          onMoreWords={getMoreWords}
          onComplete={onComplete}
          onReset={onReset}
          coverGradient={
            "linear-gradient(45deg,rgba(42, 90, 199, 1) 0%,rgba(41, 199, 172, 1) 100%)"
          }
        />
      </PaddedContainer>
      <PaddedContainer>
        {challengeSummary && (
          <PostChallengeStats challengeSummary={challengeSummary} />
        )}
      </PaddedContainer>
    </>
  );
};

export default ClassicTestPage;

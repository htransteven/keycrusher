import { add, format, formatDuration, intervalToDuration } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { getDoc, doc, setDoc } from "firebase/firestore";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { PostChallengeStats } from "../components/PostChallengeStats";
import { Teleprompter } from "../components/Teleprompter";
import { useFirebase } from "../contexts/FirebaseContext";
import { ChallengeSummary } from "../models/ChallengeSummary";
import { DailyChallenge } from "../models/DailyChallenge";

const Container = styled.div``;

const LOCALSTORAGE_DAILY_SUMMARY_KEY = "daily_summary";

const HomePage: NextPage = () => {
  const { firestore, firebaseUser } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [challengeSummary, setChallengeSummary] =
    useState<ChallengeSummary | null>(null);
  const [currentTime, setCurrenZonedtTime] = useState(Date.now());

  useEffect(() => {
    const checkForDailyChallengeAttempt = async () => {
      // today's daily challenge doc id
      const docId = format(Date.now(), "MM-dd-yyyy");

      // check firestore
      if (firebaseUser) {
        const dailyChallengeDoc = await getDoc(
          doc(firestore, `stats/${firebaseUser.uid}/history`, `${docId}`)
        );
        if (dailyChallengeDoc.exists()) {
          setChallengeSummary(dailyChallengeDoc.data() as ChallengeSummary);
          setLoading(false);
          return;
        }
      }

      // check local storage
      const summaryString = localStorage.getItem(
        LOCALSTORAGE_DAILY_SUMMARY_KEY
      );

      // no locally stored summary
      if (!summaryString) {
        setLoading(false);
        return;
      }

      const summary = JSON.parse(summaryString) as ChallengeSummary;
      const date = format(summary.time.unix.endTime, "MM-dd-yyyy");

      // old locally stored summary
      if (date !== docId) {
        localStorage.removeItem(LOCALSTORAGE_DAILY_SUMMARY_KEY);
        setLoading(false);
        return;
      }

      // upload daily challenge to user's profile
      if (firebaseUser) {
        try {
          await setDoc(
            doc(firestore, `stats/${firebaseUser.uid}/history`, `${docId}`),
            summary
          );
        } catch (error) {
          alert("failed to save challenge");
          console.log(error);
        }
      }

      setChallengeSummary(summary);
      setLoading(false);
    };

    checkForDailyChallengeAttempt();
  }, [firebaseUser, firestore]);

  useEffect(() => {
    if (!challengeSummary) return;

    const timer = setInterval(() => {
      setCurrenZonedtTime((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeSummary]);

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

  const onComplete = useCallback(
    async (summary: ChallengeSummary) => {
      if (challengeSummary) return;
      setChallengeSummary(summary);
      const docId = format(summary.time.unix.endTime, "MM-dd-yyyy");

      // store locally
      localStorage.setItem(
        LOCALSTORAGE_DAILY_SUMMARY_KEY,
        JSON.stringify(summary)
      );

      if (!firebaseUser) return;

      const dailyChallengeDoc = await getDoc(
        doc(firestore, `stats/${firebaseUser.uid}/history`, `${docId}`)
      );
      if (dailyChallengeDoc.exists()) {
        return;
      }

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
    [challengeSummary, firebaseUser, firestore]
  );

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
        {!loading && (
          <Teleprompter
            mode={"daily"}
            coverText={
              challengeSummary
                ? `Next challenge: ${formatDuration(
                    intervalToDuration({
                      end: add(
                        utcToZonedTime(new Date(), "America/Los_Angeles"),
                        {
                          days: 1,
                        }
                      ).setHours(0, 0, 0, 0),
                      start: utcToZonedTime(currentTime, "America/Los_Angeles"),
                    }),
                    { format: ["hours", "minutes", "seconds"] }
                  )}`
                : "Ready for the daily challenge?"
            }
            onMoreWords={getDailyChallengeWords}
            onComplete={onComplete}
            onReset={onReset}
            {...challengeSummary}
          />
        )}
        {challengeSummary && <PostChallengeStats {...challengeSummary} />}
      </Container>
    </>
  );
};

export default HomePage;

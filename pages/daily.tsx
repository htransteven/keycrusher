import {
  add,
  format,
  formatDuration,
  intervalToDuration,
  subDays,
} from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { getDoc, doc, setDoc } from "firebase/firestore";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { DailyStats } from "../components/DailyStats";
import { PostChallengeStats } from "../components/PostChallengeStats";
import { Teleprompter } from "../components/Teleprompter";
import { useFirebase } from "../contexts/FirebaseContext";
import { ChallengeSummary } from "../models/ChallengeSummary";
import { DailyChallenge } from "../models/DailyChallenge";
import { LocalStorageDailyStats } from "../models/localStorage";

const Container = styled.div``;

const LOCALSTORAGE_DAILY_STATS_KEY = "kc_daily_stats";

const HomePage: NextPage = () => {
  const { firestore, firebaseUser } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [challengeSummary, setChallengeSummary] =
    useState<ChallengeSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<LocalStorageDailyStats | null>(
    null
  );
  const [currentTime, setCurrenZonedtTime] = useState(Date.now());

  useEffect(() => {
    const checkForDailyChallengeAttempt = async () => {
      // today's daily challenge doc id
      const docId = formatInTimeZone(
        utcToZonedTime(Date.now(), "America/Los_Angeles"),
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      console.log(docId);

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
      const summaryString = localStorage.getItem(LOCALSTORAGE_DAILY_STATS_KEY);

      // no locally stored summary
      if (!summaryString) {
        setLoading(false);
        return;
      }

      const dailyStats = JSON.parse(summaryString) as LocalStorageDailyStats;
      if (!dailyStats) return;
      setDailyStats(dailyStats);

      if (!dailyStats.summary) return;

      // old locally stored summary
      if (
        formatInTimeZone(
          utcToZonedTime(
            dailyStats.summary.time.unix.endTime,
            "America/Los_Angeles"
          ),
          "America/Los_Angeles",
          "MM-dd-yyyy"
        ) !== docId
      ) {
        localStorage.removeItem(LOCALSTORAGE_DAILY_STATS_KEY);
        setLoading(false);
        return;
      }

      // upload daily challenge to user's profile
      if (firebaseUser) {
        try {
          await setDoc(
            doc(firestore, `stats/${firebaseUser.uid}/history`, `${docId}`),
            dailyStats.summary
          );
        } catch (error) {
          alert("failed to save challenge");
          console.log(error);
        }
      }

      setChallengeSummary(dailyStats.summary);
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
        doc(
          firestore,
          "daily",
          formatInTimeZone(
            utcToZonedTime(Date.now(), "America/Los_Angeles"),
            "America/Los_Angeles",
            "MM-dd-yyyy"
          )
        )
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
      const docId = formatInTimeZone(
        utcToZonedTime(summary.time.unix.endTime, "America/Los_Angeles"),
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      const temp = localStorage.getItem("LOCALSTORAGE_DAILY_STATS_KEY");

      const dailyStats: LocalStorageDailyStats = temp
        ? JSON.parse(temp)
        : {
            history: {
              accuracy: [],
              wpm: [],
              challengeDuration: [],
              rtt: [],
              endTimes: [],
            },
            streak: 0,
          };

      // add new historical data
      dailyStats.history.accuracy.push(
        summary.telemetry.numCorrect /
          (summary.telemetry.numCorrect + summary.telemetry.numErrors)
      );
      dailyStats.history.wpm.push(summary.wpm);
      dailyStats.history.challengeDuration.push(summary.challengeDuration);
      if (
        dailyStats.summary &&
        formatInTimeZone(
          utcToZonedTime(
            dailyStats.summary.time.unix.endTime,
            "America/Los_Angeles"
          ),
          "America/Los_Angeles",
          "MM-dd-yyyy"
        ) !==
          formatInTimeZone(
            utcToZonedTime(
              subDays(summary.time.unix.endTime, 1),
              "America/Los_Angeles"
            ),
            "America/Los_Angeles",
            "MM-dd-yyyy"
          )
      ) {
        // if the stored summary is the previous day, increase streak
        dailyStats.streak = dailyStats.streak + 1;
      } else {
        dailyStats.streak = 1;
      }
      dailyStats.summary = summary;
      let sumRTT = 0;
      let sumRTTCount = 0;
      for (const wIndex in summary.telemetry.history) {
        for (const cIndex in summary.telemetry.history[wIndex]) {
          const keyTelemetry = summary.telemetry.history[wIndex][cIndex];
          if (keyTelemetry.rtt === 0) continue;

          sumRTT += keyTelemetry.rtt;
          sumRTTCount += 1;
        }
      }
      dailyStats.history.rtt.push(sumRTT / sumRTTCount);
      dailyStats.history.endTimes.push(summary.time.unix.endTime);

      localStorage.setItem(
        LOCALSTORAGE_DAILY_STATS_KEY,
        JSON.stringify(dailyStats)
      );

      setDailyStats(dailyStats);

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
                        utcToZonedTime(Date.now(), "America/Los_Angeles"),
                        {
                          days: 1,
                        }
                      ).setHours(0, 0, 0, 0),
                      start: utcToZonedTime(currentTime, "America/Los_Angeles"),
                    }),
                    { format: ["hours", "minutes", "seconds"], zero: true }
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
        {dailyStats && <DailyStats {...dailyStats} />}
      </Container>
    </>
  );
};

export default HomePage;

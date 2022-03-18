import {
  add,
  format,
  formatDuration,
  intervalToDuration,
  isSameDay,
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

const LOCALSTORAGE_DAILY_STATS_KEY = "KC_DS";

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
      const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
      const todayFormatted = formatInTimeZone(
        today,
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      // check firestore
      if (firebaseUser) {
        const todaysAttemptDoc = await getDoc(
          doc(
            firestore,
            `stats/${firebaseUser.uid}/history`,
            `${todayFormatted}`
          )
        );
        if (todaysAttemptDoc.exists()) {
          setChallengeSummary(todaysAttemptDoc.data() as ChallengeSummary);
          setLoading(false);
          return;
        }
      }

      // check local storage
      const dailyStatsString = localStorage.getItem(
        LOCALSTORAGE_DAILY_STATS_KEY
      );

      // no locally stored summary
      if (!dailyStatsString) {
        setLoading(false);
        return;
      }

      const dailyStats = JSON.parse(dailyStatsString) as LocalStorageDailyStats;
      if (!dailyStats) return;
      setDailyStats(dailyStats);

      if (!dailyStats.todaysAttempt) return;

      // check local storage for daily attempt
      // if not found, there is nothing left to do
      if (
        isSameDay(
          utcToZonedTime(
            dailyStats.todaysAttempt.time.unix.endTime,
            "America/Los_Angeles"
          ),
          today
        )
      ) {
        setLoading(false);
        return;
      }

      // if a daily attempt was found in local storage, upload to firebase
      // we already know it doesn't exist because we checked above
      if (firebaseUser) {
        try {
          await setDoc(
            doc(
              firestore,
              `stats/${firebaseUser.uid}/history`,
              `${todayFormatted}`
            ),
            dailyStats.todaysAttempt
          );
        } catch (error) {
          alert("failed to save challenge");
          console.log(error);
        }
      }

      setChallengeSummary(dailyStats.todaysAttempt);
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
      // if there is already a record of the attempt, do nothing
      // this limits to 1 attempt per person
      if (challengeSummary) return;
      setChallengeSummary(summary);

      // today's daily challenge doc id
      const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
      const todayFormatted = formatInTimeZone(
        today,
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      const dailyStatsString = localStorage.getItem(
        "LOCALSTORAGE_DAILY_STATS_KEY"
      );

      // load local storage or initiate new one
      const dailyStats: LocalStorageDailyStats = dailyStatsString
        ? JSON.parse(dailyStatsString)
        : {
            streak: 0,
            history: {},
            todaysAttempt: summary,
          };

      // calculate averageRTT
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

      dailyStats.history = {
        ...dailyStats.history,
        [todayFormatted]: {
          endTime: summary.time.unix.endTime,
          accuracy:
            summary.telemetry.numCorrect /
            (summary.telemetry.numCorrect + summary.telemetry.numErrors),
          wpm: summary.wpm,
          averageRTT: sumRTT / sumRTTCount,
          challengeDuration: summary.challengeDuration,
        },
      };

      console.log(dailyStats);

      console.log(
        formatInTimeZone(
          utcToZonedTime(
            subDays(dailyStats.todaysAttempt.time.unix.endTime, 1),
            "America/Los_Angeles"
          ),
          "America/Los_Angeles",
          "MM-dd-yyyy"
        )
      );

      // if your history includes yesterday, increment streak
      // otherwise, reset
      if (
        dailyStats.history[
          formatInTimeZone(
            utcToZonedTime(
              subDays(dailyStats.todaysAttempt.time.unix.endTime, 1),
              "America/Los_Angeles"
            ),
            "America/Los_Angeles",
            "MM-dd-yyyy"
          )
        ]
      ) {
        dailyStats.streak = dailyStats.streak + 1;
      } else {
        dailyStats.streak = 1;
      }

      localStorage.setItem(
        LOCALSTORAGE_DAILY_STATS_KEY,
        JSON.stringify(dailyStats)
      );

      setDailyStats(dailyStats);

      if (!firebaseUser) return;
      // if the user is logged in, upload challenge summary if first attempt

      // check for first attempt
      const dailyChallengeDoc = await getDoc(
        doc(firestore, `stats/${firebaseUser.uid}/history`, `${todayFormatted}`)
      );
      if (dailyChallengeDoc.exists()) {
        return;
      }

      // upload challenge summary
      try {
        await setDoc(
          doc(
            firestore,
            `stats/${firebaseUser.uid}/history`,
            `${todayFormatted}`
          ),
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
            disabled={!!challengeSummary}
          />
        )}
        {challengeSummary && <PostChallengeStats {...challengeSummary} />}
        {dailyStats && <DailyStats {...dailyStats} />}
      </Container>
    </>
  );
};

export default HomePage;

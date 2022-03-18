import {
  add,
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
  const [dailyStats, setDailyStats] = useState<LocalStorageDailyStats | null>(
    null
  );
  const [currentTime, setCurrenZonedtTime] = useState(Date.now());
  const [hasAttempted, setHasAttempted] = useState(false);

  // load local storage stats or initiate new
  useEffect(() => {
    const dailyStatsString = localStorage.getItem(LOCALSTORAGE_DAILY_STATS_KEY);
    const newStats = dailyStatsString
      ? JSON.parse(dailyStatsString)
      : {
          streak: 0,
          history: {},
        };

    // store new local storage stats
    if (!dailyStatsString) {
      localStorage.setItem(
        LOCALSTORAGE_DAILY_STATS_KEY,
        JSON.stringify(newStats)
      );
    }
    setDailyStats(newStats);
  }, []);

  useEffect(() => {
    const checkForDailyChallengeAttempt = async () => {
      // wait for local storage load
      if (!dailyStats) return;

      // today's daily challenge doc id
      const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
      const todayFormatted = formatInTimeZone(
        today,
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      // check firestore for attempt first
      // sync firebase to local storage if needed
      if (firebaseUser) {
        const todaysAttemptDoc = await getDoc(
          doc(
            firestore,
            `stats/${firebaseUser.uid}/history`,
            `${todayFormatted}`
          )
        );
        if (todaysAttemptDoc.exists()) {
          // set firestore data in local storage to reduce cheating
          const stats: LocalStorageDailyStats = {
            ...dailyStats,
            prevAttempt: todaysAttemptDoc.data() as ChallengeSummary,
          };
          localStorage.setItem(
            LOCALSTORAGE_DAILY_STATS_KEY,
            JSON.stringify(stats)
          );
          setHasAttempted(true);
          setDailyStats(stats);
          setLoading(false);
          return;
        }
      }

      // if no user, check local storage for today's attempt
      // if no attempt, do nothing
      if (
        !dailyStats.prevAttempt ||
        !isSameDay(
          utcToZonedTime(
            dailyStats.prevAttempt.time.unix.endTime,
            "America/Los_Angeles"
          ),
          today
        )
      ) {
        setLoading(false);
        return;
      }

      // if a daily attempt was found in local storage, sync to firebase
      // note: we already know it doesn't exist because we checked above
      if (firebaseUser) {
        try {
          await setDoc(
            doc(
              firestore,
              `stats/${firebaseUser.uid}/history`,
              `${todayFormatted}`
            ),
            dailyStats.prevAttempt
          );
        } catch (error) {
          alert("failed to save challenge");
          console.log(error);
        }
      }

      setHasAttempted(true);
      setLoading(false);
    };

    checkForDailyChallengeAttempt();
  }, [dailyStats, firebaseUser, firestore]);

  useEffect(() => {
    if (!dailyStats?.prevAttempt) return;

    const timer = setInterval(() => {
      setCurrenZonedtTime((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [dailyStats?.prevAttempt]);

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
      // today's daily challenge doc id
      const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
      const todayFormatted = formatInTimeZone(
        today,
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      // CHECK IF USER HAS ALREADY ATTEMPTED TODAY'S CHALLENGE
      if (!hasAttempted) {
        // further checks to prevent cheating
        if (firebaseUser) {
          // Method 1: if user is logged in, check firestore for attempt
          const dailyChallengeDoc = await getDoc(
            doc(
              firestore,
              `stats/${firebaseUser.uid}/history`,
              `${todayFormatted}`
            )
          );
          if (dailyChallengeDoc.exists()) {
            return;
          } else {
            // if user is logged in but attempt was not found in firestore, upload it
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
              alert("failed to save challenge attempt");
              console.log(error);
            }
          }
        } else if (dailyStats?.history[todayFormatted]) {
          // Method 2: if user is not logged in, check local storage
          return;
        }
      }

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

      const newStats: LocalStorageDailyStats = dailyStats
        ? {
            ...dailyStats,
            history: {
              ...dailyStats?.history,
              [todayFormatted]: {
                endTime: summary.time.unix.endTime,
                accuracy:
                  summary.telemetry.numCorrect /
                  (summary.telemetry.numCorrect + summary.telemetry.numErrors),
                wpm: summary.wpm,
                averageRTT: sumRTT / sumRTTCount,
                challengeDuration: summary.challengeDuration,
              },
            },
            prevAttempt: summary,
          }
        : {
            streak: 1,
            history: {
              [todayFormatted]: {
                endTime: summary.time.unix.endTime,
                accuracy:
                  summary.telemetry.numCorrect /
                  (summary.telemetry.numCorrect + summary.telemetry.numErrors),
                wpm: summary.wpm,
                averageRTT: sumRTT / sumRTTCount,
                challengeDuration: summary.challengeDuration,
              },
            },
            prevAttempt: summary,
          };

      // if your history includes yesterday, increment streak
      // otherwise, reset to 1
      if (
        newStats.history[
          formatInTimeZone(
            utcToZonedTime(
              subDays(newStats.prevAttempt.time.unix.endTime, 1),
              "America/Los_Angeles"
            ),
            "America/Los_Angeles",
            "MM-dd-yyyy"
          )
        ]
      ) {
        newStats.streak = newStats.streak + 1;
      } else {
        newStats.streak = 1;
      }

      localStorage.setItem(
        LOCALSTORAGE_DAILY_STATS_KEY,
        JSON.stringify(newStats)
      );
      setDailyStats(newStats);
      setHasAttempted(true);
    },
    [dailyStats, firebaseUser, firestore, hasAttempted]
  );

  console.log(dailyStats);

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
              hasAttempted
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
            onComplete={hasAttempted ? () => {} : onComplete}
            onReset={() => {}}
            disabled={hasAttempted}
          />
        )}
        {dailyStats?.prevAttempt && (
          <PostChallengeStats {...dailyStats.prevAttempt} />
        )}
        {dailyStats && Object.keys(dailyStats.history).length > 0 && (
          <DailyStats {...dailyStats} />
        )}
      </Container>
    </>
  );
};

export default HomePage;

import { add, formatDuration, intervalToDuration, subDays } from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { DailyStatsViewer } from "../components/DailyStatsViewer";
import { Loading } from "../components/Loading";
import { PostChallengeStats } from "../components/PostChallengeStats";
import { Teleprompter } from "../components/Teleprompter";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUser } from "../contexts/UserContext";
import { DailyStats } from "../models/api/stats";
import { ChallengeSummary } from "../models/firestore/ChallengeSummary";
import { DailyChallenge } from "../models/firestore/DailyChallenge";
import { challengeSummaryToDailyChallengeSummary } from "../utils/api/challengeSummaryToDailyChallengeSummary";

const Container = styled.div``;

const LOCALSTORAGE_DAILY_STATS_KEY = "KC_DS";

const HomePage: NextPage = () => {
  const { firebaseUser } = useFirebase();
  const { loadingUser } = useUser();
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [currentZonedTime, setCurrentZonedTime] = useState(Date.now());
  const [hasAttempted, setHasAttempted] = useState<boolean | null>(null);
  const [challengeSummary, setChallengeSummary] =
    useState<ChallengeSummary | null>(null);

  // load daily stats either from firebase or local storage
  useEffect(() => {
    const loadDailyStats = async () => {
      if (loadingUser || hasAttempted) return;

      if (firebaseUser) {
        const res = await fetch("/api/user/stats", {
          headers: { authorization: `Bearer ${firebaseUser.uid}` },
        });
        if (!res.ok) {
          console.log(await res.json());
          alert("failed to load daily stats");
        }
        const data = (await res.json()) as DailyStats;
        setDailyStats(data);
      } else {
        const dailyStatsString = localStorage.getItem(
          LOCALSTORAGE_DAILY_STATS_KEY
        );
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
      }
    };
    loadDailyStats();
  }, [firebaseUser, hasAttempted, loadingUser]);

  useEffect(() => {
    const checkForDailyChallengeAttempt = async () => {
      // wait for local storage load
      if (!dailyStats || hasAttempted) return;

      // today's daily challenge doc id
      const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
      const todayFormatted = formatInTimeZone(
        today,
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      if (dailyStats.history[todayFormatted]) {
        setHasAttempted(true);
      } else {
        setHasAttempted(false);
      }
    };

    checkForDailyChallengeAttempt();
  }, [dailyStats, hasAttempted]);

  useEffect(() => {
    if (!hasAttempted) return;

    const timer = setInterval(() => {
      setCurrentZonedTime((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAttempted]);

  const getDailyChallengeWords = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/daily");
      if (!res.ok) {
        console.log(await res.json());
        alert("failed to get daily challenge");
        return null;
      }

      // randomize order
      const dailyChallange = (await res.json()) as DailyChallenge;
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
  }, []);

  const onComplete = useCallback(
    async (summary: ChallengeSummary) => {
      if (hasAttempted) return;
      setHasAttempted(true);
      setChallengeSummary(summary);

      /** Daily Stats: Firestore Version */
      const challengeRes = await fetch("/api/challenge/daily", {
        method: "POST",
        headers: firebaseUser
          ? { authorization: `Bearer ${firebaseUser.uid}` }
          : undefined,
        body: JSON.stringify(summary),
      });
      if (challengeRes.status === 304) return;
      if (!challengeRes.ok) {
        console.log(await challengeRes.json());
        alert("failed to upload challenge");
      }
      if (firebaseUser) {
        const statsRes = await fetch("/api/user/stats", {
          headers: { authorization: `Bearer ${firebaseUser.uid}` },
        });
        if (!statsRes.ok) {
          console.log(await statsRes.json());
          alert("failed to get new stats");
        }
        setDailyStats((await statsRes.json()) as DailyStats);
        return;
      }

      /** Daily Stats: Local Storage Version */

      const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
      const todayFormatted = formatInTimeZone(
        today,
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      const dailyChallengeSummary =
        challengeSummaryToDailyChallengeSummary(summary);

      const newStats: DailyStats = dailyStats
        ? {
            ...dailyStats,
            history: {
              ...dailyStats?.history,
              [todayFormatted]: dailyChallengeSummary,
            },
          }
        : {
            streak: 1,
            history: {
              [todayFormatted]: dailyChallengeSummary,
            },
          };

      if (
        newStats.history[
          formatInTimeZone(
            subDays(
              utcToZonedTime(summary.time.unix.endTime, "America/Los_Angeles"),
              1
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
    },
    [dailyStats, firebaseUser, hasAttempted]
  );

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
        {(loadingUser || hasAttempted === null) && (
          <Loading value="DAILY CHALLENGE" />
        )}
        {!loadingUser && hasAttempted !== null && (
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
                      start: utcToZonedTime(
                        currentZonedTime,
                        "America/Los_Angeles"
                      ),
                    }),
                    { format: ["hours", "minutes", "seconds"], zero: true }
                  )}`
                : "Ready for the daily challenge?"
            }
            onMoreWords={getDailyChallengeWords}
            onComplete={onComplete}
            onReset={() => {}}
            disabled={hasAttempted}
          />
        )}
        {challengeSummary && <PostChallengeStats {...challengeSummary} />}
        {dailyStats && Object.keys(dailyStats.history).length > 0 && (
          <DailyStatsViewer {...dailyStats} />
        )}
      </Container>
    </>
  );
};

export default HomePage;

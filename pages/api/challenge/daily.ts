import { subDays } from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";
import { ChallengeSummary } from "../../../models/firestore/ChallengeSummary";
import { DailyChallenge } from "../../../models/firestore/DailyChallenge";
import { MLChallengeEntry } from "../../../models/firestore/ml";
import { Stats } from "../../../models/firestore/stats";

type POSTBody = ChallengeSummary;

const handlePOST: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  const authHeader = req.headers["authorization"];
  let hasAuthorization = true;
  if (!authHeader || !authHeader.includes("Bearer ")) {
    hasAuthorization = false;
  }

  const summary = JSON.parse(req.body) as POSTBody;
  if (summary.mode !== "daily") {
    res.status(400).json({ message: "Not a daily challenge attempt" });
    return;
  }

  const date = utcToZonedTime(summary.time.unix.endTime, "America/Los_Angeles");
  const dateFormatted = formatInTimeZone(
    date,
    "America/Los_Angeles",
    "MM-dd-yyyy"
  );

  const userId = authHeader?.split(" ")[1];
  if (hasAuthorization) {
    const userDoc = await db
      .collection("users")
      .doc(userId as string)
      .get();

    // if user is authenticated, check for existing attempts
    if (userDoc.exists) {
      const existingAttempt = await db
        .collection(`stats/${userId}/history`)
        .doc(dateFormatted)
        .get();
      if (existingAttempt.exists) {
        res.status(304).end();
        return;
      }

      // upload attempt
      await db
        .collection(`stats/${userId}/history`)
        .doc(dateFormatted)
        .create(summary);

      // update user daily stats with new daily challenge
      const stats = (
        await db
          .collection("stats")
          .doc(userId as string)
          .get()
      ).data() as Stats;
      const dailyStats = stats.daily;
      dailyStats.historyIds.push(dateFormatted);

      const dayBeforeFormatted = formatInTimeZone(
        subDays(
          utcToZonedTime(summary.time.unix.endTime, "America/Los_Angeles"),
          1
        ),
        "America/Los_Angeles",
        "MM-dd-yyyy"
      );

      if (dailyStats.historyIds.includes(dayBeforeFormatted)) {
        dailyStats.streak = dailyStats.streak + 1;
      } else {
        dailyStats.streak = 1;
      }
      await db
        .collection("stats")
        .doc(userId as string)
        .set(stats);
    } else {
      await db
        .collection(`stats/${userId}/history`)
        .doc(dateFormatted)
        .create(summary);
    }
  }

  /** Collect anonymous randomized challenge submissions for ML model */
  if (true) {
    const mlChallengeDataPayload: MLChallengeEntry = {
      challengeDuration: summary.challengeDuration,
      wpm: summary.wpm,
      accuracy:
        summary.telemetry.numCorrect /
        (summary.telemetry.numCorrect + summary.telemetry.numErrors),
      completedOnMobile: summary.completedOnMobile,
    };
    await db.collection(`ml/data/challenges`).add(mlChallengeDataPayload);
  }

  // update daily aggregate stats
  const dailyChallenge = (
    await db.collection("daily").doc(dateFormatted).get()
  ).data() as DailyChallenge;

  dailyChallenge.attempts += 1;
  dailyChallenge.sumAccuracy += summary.telemetry.accuracy;
  dailyChallenge.sumTime += summary.challengeDuration;
  dailyChallenge.sumWPM += summary.wpm;

  await db.collection("daily").doc(dateFormatted).set(dailyChallenge);

  res.status(200).send(summary);
};

const handleGET: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  try {
    const today = utcToZonedTime(Date.now(), "America/Los_Angeles");
    const todayFormatted = formatInTimeZone(
      today,
      "America/Los_Angeles",
      "MM-dd-yyyy"
    );
    const dailyChallengeDoc = await db
      .collection("daily")
      .doc(todayFormatted)
      .get();
    if (!dailyChallengeDoc.exists) {
      res.status(500).json({ message: "Daily challenge doc not found" });
      return;
    }

    res.status(200).json(dailyChallengeDoc.data());
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Interval service error. Check logs. " });
  }
};

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "POST": {
      return handlePOST(req, res);
    }
    case "GET": {
      return handleGET(req, res);
    }
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;

import { subDays } from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";
import { ChallengeSummary } from "../../../models/firestore/ChallengeSummary";
import { DailyChallenge } from "../../../models/firestore/DailyChallenge";
import { Stats } from "../../../models/firestore/stats";
import { challengeSummaryToDailyChallengeSummary } from "../../../utils/api/challengeSummaryToDailyChallengeSummary";

interface GETQuery {
  username?: string;
  endTime?: string; // unix timestamp
  formattedEndTime?: string;
}

const handleGET: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  const { username, endTime, formattedEndTime } = req.query as GETQuery;
  if (!username) {
    res.status(400).json({ message: "username is required in the query" });
    return;
  }

  try {
    const userSnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .get();
    if (userSnapshot.empty) {
      res.status(404).json({ code: 404, message: "User not found." });
      return;
    } else if (userSnapshot.size > 1) {
      res
        .status(500)
        .json({ code: 500, message: "More than one user was found." });
    }

    const userDoc = userSnapshot.docs[0];

    let userHistorySnapshot;
    if (formattedEndTime) {
      userHistorySnapshot = await db
        .collection(`stats/${userDoc.id}/history`)
        .doc(formattedEndTime)
        .get();

      if (!userHistorySnapshot.exists) {
        res.status(404).json({
          code: 404,
          message: `Challenge summary not found with formatted endTime: ${formattedEndTime}`,
        });
        return;
      }

      res.status(200).json(userHistorySnapshot.data());
    } else if (endTime) {
      userHistorySnapshot = await db
        .collection(`stats/${userDoc.id}/history`)
        .where("time.unix.endTime", "==", endTime)
        .get();
      if (userHistorySnapshot.empty) {
        res.status(404).json({
          message: `Challenge summary not found with endTime: ${endTime}`,
        });
        return;
      } else if (userHistorySnapshot.size > 1) {
        res.status(500).json({
          code: 500,
          message: "More than one challenge summary was found.",
        });
      }

      res.status(200).json(userHistorySnapshot.docs[0].data());
    } else {
      res.status(400).json({
        message: "endTime or formattedEndTime is required in the query",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Interval service error. Check logs. " });
  }
};

type POSTBody = ChallengeSummary;

const handlePOST: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.includes("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const userId = authHeader.split(" ")[1];
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    res.status(401).json({ message: "Invalid user id" });
    return;
  }

  const summary = JSON.parse(req.body) as POSTBody;

  const date = utcToZonedTime(summary.time.unix.endTime, "America/Los_Angeles");
  const dateFormatted = formatInTimeZone(
    date,
    "America/Los_Angeles",
    summary.mode === "daily" ? "MM-dd-yyyy" : "MM-dd-yyyy_hh:mm:ss:SSS_a"
  );

  // if mode is daily, check for previous attempts
  if (summary.mode === "daily") {
    const existingAttempt = await db
      .collection(`stats/${userId}/history`)
      .doc(dateFormatted)
      .get();
    if (existingAttempt.exists) {
      res.status(304).end();
      return;
    }

    const dailyChallenge = (
      await db.collection("daily").doc(dateFormatted).get()
    ).data() as DailyChallenge;

    const dailyChallengeSummary =
      challengeSummaryToDailyChallengeSummary(summary);

    dailyChallenge.attempts += 1;
    dailyChallenge.sumAccuracy += dailyChallengeSummary.accuracy;
    dailyChallenge.sumTime += dailyChallengeSummary.challengeDuration;
    dailyChallenge.sumWPM += dailyChallengeSummary.wpm;

    await db.collection("daily").doc(dateFormatted).set(dailyChallenge);

    // update daily stats with new daily challenge
    const stats = (
      await db.collection("stats").doc(userId).get()
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
    await db.collection("stats").doc(userId).set(stats);
  }

  try {
    await db
      .collection(`stats/${userId}/history`)
      .doc(dateFormatted)
      .create(summary);
    res.status(200).send(summary);
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

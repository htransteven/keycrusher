import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";
import { DailyStats } from "../../../models/api/stats";
import { ChallengeSummary } from "../../../models/firestore/ChallengeSummary";
import { Stats } from "../../../models/firestore/stats";

const handleGET: NextApiHandler = async (req, res) => {
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

  const dailyStatsDoc = await db.collection("stats").doc(userId).get();
  if (!dailyStatsDoc.exists) {
    const newStatsPayload: Stats = {
      daily: {
        streak: 0,
        historyIds: [],
      },
    };
    await db.collection("stats").doc(userId).set(newStatsPayload);
    res.status(200).json({ streak: 0, history: {} });
  }

  const stats = dailyStatsDoc.data() as Stats;
  const dailyStats = stats.daily;
  const dailyStatsTranformed: DailyStats = {
    streak: dailyStats.streak,
    history: {},
  };
  const cleanedIds = [];
  for (let i = 0; i < dailyStats.historyIds.length; i++) {
    const historyDoc = await db
      .collection(`stats/${userId}/history`)
      .doc(dailyStats.historyIds[i])
      .get();

    if (!historyDoc.exists) continue;
    cleanedIds.push(dailyStats.historyIds[i]);
    const summary = historyDoc.data() as ChallengeSummary;
    const date = utcToZonedTime(
      summary.time.unix.endTime,
      "America/Los_Angeles"
    );
    const dateFormatted = formatInTimeZone(
      date,
      "America/Los_Angeles",
      "MM-dd-yyyy"
    );
    dailyStatsTranformed.history[dateFormatted] =
      historyDoc.data() as ChallengeSummary;
  }

  await db
    .collection("stats")
    .doc(userId)
    .update({ ["daily.historyIds"]: cleanedIds });

  res.status(200).json(dailyStatsTranformed);
};

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET": {
      return handleGET(req, res);
    }
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;

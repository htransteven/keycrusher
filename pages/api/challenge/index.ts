import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";
import { ChallengeSummary } from "../../../models/firestore/ChallengeSummary";
import { MLChallengeEntry } from "../../../models/firestore/ml";

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
  let hasAuthorization = authHeader && authHeader.includes("Bearer ");

  const summary = JSON.parse(req.body) as POSTBody;
  if (summary.mode !== "default") {
    res.status(400).json({ message: "Not a default challenge attempt" });
    return;
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

  if (!hasAuthorization) {
    res.status(200).end(summary);
    return;
  }

  const userId = (authHeader as string).split(" ")[1];
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    res.status(401).json({ message: "Invalid user id" });
    return;
  }

  const date = utcToZonedTime(summary.time.unix.endTime, "America/Los_Angeles");
  const dateFormatted = formatInTimeZone(
    date,
    "America/Los_Angeles",
    "MM-dd-yyyy_hh:mm:ss:SSS_a"
  );

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

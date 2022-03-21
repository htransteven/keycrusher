import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";

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
    case "GET": {
      return handleGET(req, res);
    }
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;

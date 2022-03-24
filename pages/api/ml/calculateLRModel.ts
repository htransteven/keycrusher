import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";
import { MLChallengeEntry } from "../../../models/firestore/ml";
import SLR from "ml-regression-simple-linear";

const handleGET: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  try {
    const challengeSnapshot = await db.collection("ml/data/challenges").get();
    const inputs: number[] = [];
    const outputs: number[] = [];
    challengeSnapshot.docs.forEach((doc) => {
      const challenge = doc.data() as MLChallengeEntry;
      inputs.push(challenge.wpm);
      outputs.push(challenge.challengeDuration);
    });

    const regression = new SLR(inputs, outputs);

    res.status(200).json(regression.toJSON());
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

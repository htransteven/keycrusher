import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";

interface GETQuery {
  email?: string;
  username?: string;
}

const handleGET: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  const { email, username } = req.query as GETQuery;
  if (!email && !username) {
    res.status(400).json({
      message: "An email or username is required in the query",
    });
  }

  let userSnapshot;
  if (email) {
    userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
  } else {
    userSnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .get();
  }

  if (userSnapshot.empty) {
    res.status(404).json({ message: "User not found." });
    return;
  } else if (userSnapshot.size > 1) {
    res.status(500).json({ message: "More than one user was found." });
  }

  res.status(200).json(userSnapshot.docs[0].data());
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

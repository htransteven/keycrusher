import { NextApiHandler } from "next";
import admin from "../../../../lib/firebase";
import { User } from "../../../../models/firestore/User";

interface POSTBody {
  email?: string;
  username?: string;
}

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

  const { email, username } = JSON.parse(req.body) as POSTBody;
  if (!email && !username) {
    res.status(400).json({
      message: "An email or username is required in the body",
    });
    return;
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
    res.status(404).json({ code: 404, message: "User not found." });
    return;
  } else if (userSnapshot.size > 1) {
    res
      .status(500)
      .json({ code: 500, message: "More than one user was found." });
  }

  const otherUserDoc = userSnapshot.docs[0];
  const otherUserId = otherUserDoc.id;
  try {
    await db.runTransaction(async (t) => {
      t.update(db.collection("network").doc(otherUserId), {
        [`followers.${userId}`]: true,
      });
      t.update(db.collection("network").doc(userId), {
        [`following.${otherUserId}`]: true,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Interval service error. Check logs. " });
    return;
  }

  res
    .status(200)
    .send({ message: `Followed ${(otherUserDoc.data() as User).username}` });
};

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "POST": {
      return handlePOST(req, res);
    }
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;

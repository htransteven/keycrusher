import { firestore } from "firebase-admin";
import { NextApiHandler } from "next";
import admin from "../../../../lib/firebase";
import { UserNetwork } from "../../../../models/firestore/Network";
import { User } from "../../../../models/firestore/User";

interface GETQuery {
  username?: string;
}

const handleGET: NextApiHandler = async (req, res) => {
  const db = admin.firestore();

  const { username } = req.query as GETQuery;
  if (!username) {
    res.status(400).json({
      message: "A username is required in the query",
    });
  }

  const userSnapshot = await db
    .collection("users")
    .where("username", "==", username)
    .get();

  if (userSnapshot.empty) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const userId = userSnapshot.docs[0].id;
  const networkDoc = await db.collection("network").doc(userId).get();
  if (!networkDoc.exists) {
    // lazy create network doc if needed
    await db
      .collection("network")
      .doc(userId)
      .create({ followers: {}, following: {} });
    res.status(200).json({ followers: [], following: [] });
    return;
  }

  const network = networkDoc.data() as UserNetwork;
  const followerUserIds = Object.keys(network.followers);
  const followers = [];
  for (const fuid of followerUserIds) {
    const followerUserDoc = await db.collection("users").doc(fuid).get();

    if (!followerUserDoc.exists) {
      network.followers[fuid] = firestore.FieldValue.delete() as any;
      continue;
    }

    followers.push((followerUserDoc.data() as User).username);
  }
  const followingUserIds = Object.keys(network.following);
  const following = [];
  for (const fuid of followingUserIds) {
    const followingUserDoc = await db.collection("users").doc(fuid).get();

    if (!followingUserDoc.exists) {
      network.following[fuid] = firestore.FieldValue.delete() as any;
      continue;
    }

    following.push((followingUserDoc.data() as User).username);
  }

  res.status(200).json({ followers, following });
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

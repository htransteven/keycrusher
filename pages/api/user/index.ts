import { NextApiHandler } from "next";
import admin from "../../../lib/firebase";
import { UserNetwork } from "../../../models/firestore/Network";
import { userIdNetworkToUsernameNetwork } from "../../../utils/api/userIdNetworkToUsernameNetwork";

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

  const userIdNetwork = networkDoc.data() as UserNetwork;
  const usernameNetwork = await userIdNetworkToUsernameNetwork(userIdNetwork);

  res.status(200).json({
    ...userSnapshot.docs[0].data(),
    network: usernameNetwork,
  });
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

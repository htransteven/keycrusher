import { firestore } from "firebase-admin";
import admin from "../../lib/firebase";
import { UserNetwork } from "../../models/api/user";
import { UserNetwork as FirestoreUserNetwork } from "../../models/firestore/Network";
import { User } from "../../models/firestore/User";

export const userIdNetworkToUsernameNetwork = async (
  network: FirestoreUserNetwork
): Promise<UserNetwork> => {
  const db = admin.firestore();

  const followerUserIds = Object.keys(network.followers);
  const followers: { [username: string]: boolean } = {};
  for (const fuid of followerUserIds) {
    const followerUserDoc = await db.collection("users").doc(fuid).get();

    if (!followerUserDoc.exists) {
      network.followers[fuid] = firestore.FieldValue.delete() as any;
      continue;
    }

    followers[(followerUserDoc.data() as User).username] = true;
  }
  const followingUserIds = Object.keys(network.following);
  const following: { [username: string]: boolean } = {};
  for (const fuid of followingUserIds) {
    const followingUserDoc = await db.collection("users").doc(fuid).get();

    if (!followingUserDoc.exists) {
      network.following[fuid] = firestore.FieldValue.delete() as any;
      continue;
    }

    following[(followingUserDoc.data() as User).username] = true;
  }
  return { followers, following };
};

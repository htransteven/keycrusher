import admin, { ServiceAccount } from "firebase-admin";
import sa from "./key-crusher-firebase-adminsdk-b9fye-ddea94ecc8.json";

try {
  admin.initializeApp({
    credential: admin.credential.cert(sa as ServiceAccount),
  });
  console.log("🔥 Initialized Firebase!");
} catch (error: any) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  if (!/already exists/u.test(error.message)) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

export default admin;

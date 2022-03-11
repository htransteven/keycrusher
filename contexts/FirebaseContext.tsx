import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import {
  Auth,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  Firestore,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getUnixTime } from "date-fns";
import { User } from "../models/User";

const firebaseConfig = {
  apiKey: "AIzaSyDcrT1jyxO17nfGPOwwFrvLTMCM_a290J4",
  authDomain: "key-crusher.firebaseapp.com",
  projectId: "key-crusher",
  storageBucket: "key-crusher.appspot.com",
  messagingSenderId: "141071597239",
  appId: "1:141071597239:web:3d7e2d21ae63156b6bd732",
  measurementId: "G-H6G2WP19PZ",
};

interface FirebaseContext {
  app: FirebaseApp;
  auth: Auth;
  analytics: Analytics;
  firestore: Firestore;
  firebaseUser: FirebaseUser | null;
}

const FirebaseContext = createContext<FirebaseContext | null>(null);

export const useFirebase = () => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error("Firebase Context is null!");
  return ctx;
};

export const FirebaseProvider: React.FC = ({ children }) => {
  const [app] = useState(initializeApp(firebaseConfig));
  const [auth, setAuth] = useState<Auth | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // have to fetch in a useEffect because window doesn't exist to use in initial state
  useEffect(() => {
    setAuth(getAuth(app));
    setAnalytics(getAnalytics(app));
    setFirestore(getFirestore(app));
  }, [app]);

  useEffect(() => {
    if (!auth) return;
    const subscriber = auth.onAuthStateChanged((user) => setFirebaseUser(user));
    return subscriber;
  }, [auth]);

  useEffect(() => {
    if (!auth || !firestore) return;
    // After returning from the redirect when your app initializes you can obtain the result
    getRedirectResult(auth).then((result) => {
      if (result) {
        getDoc(doc(firestore, "users", result.user.uid)).then((userDoc) => {
          if (!userDoc.exists()) {
            if (!result.user.email)
              throw new Error(
                "The user from Google's redirect result has no email"
              );
            const now = getUnixTime(new Date());
            const userPayload: User = {
              username: result.user.email.substring(
                0,
                result.user.email.indexOf("@")
              ),
              email: result.user.email,
              lastLoggedIn: now,
              created: now,
            };

            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential) {
              userPayload["oauth"] = {
                providerId: credential.providerId,
                idToken: credential.idToken,
                accessToken: credential.accessToken,
              };
            }
            setDoc(doc(firestore, "users", result.user.uid), userPayload);
          }
        });
      }
    });
  }, [auth, firestore]);

  if (!analytics || !auth || !firestore) return null;

  return (
    <FirebaseContext.Provider
      value={{ app, auth, analytics, firestore, firebaseUser }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

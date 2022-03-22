import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { Auth, getAuth, User as FirebaseUser } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcrT1jyxO17nfGPOwwFrvLTMCM_a290J4",
  authDomain: "auth.keycrusher.com",
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
  loadingFirebaseUser: boolean;
  firebaseUser: FirebaseUser | null;
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
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
  const [loadingFirebaseUser, setLoadingFirebaseUser] = useState(true);

  // have to fetch in a useEffect because window doesn't exist to use in initial state
  useEffect(() => {
    setAuth(getAuth(app));
    setAnalytics(getAnalytics(app));
    setFirestore(getFirestore(app));
  }, [app]);

  useEffect(() => {
    if (!auth) return;
    const subscriber = auth.onAuthStateChanged((newFirebaseUser) => {
      if (newFirebaseUser?.uid !== firebaseUser?.uid) {
        setFirebaseUser(newFirebaseUser);
      }
      if (loadingFirebaseUser) {
        setLoadingFirebaseUser(false);
      }
    });

    return subscriber;
  }, [auth, firebaseUser?.uid, loadingFirebaseUser]);

  if (!analytics || !auth || !firestore) return null;

  return (
    <FirebaseContext.Provider
      value={{
        app,
        auth,
        analytics,
        firestore,
        loadingFirebaseUser,
        firebaseUser,
        setFirebaseUser,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

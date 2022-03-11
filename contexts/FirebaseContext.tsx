import { initializeApp, FirebaseApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { createContext, useContext, useEffect, useState } from "react";

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
  analytics: Analytics;
}

const FirebaseContext = createContext<FirebaseContext | null>(null);

export const useFirebaseApp = () => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error("Firebase Context is null!");
  return ctx.app;
};

export const useFirebaseAnalytics = () => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error("Firebase Context is null!");

  return ctx.analytics;
};

export const FirebaseProvider: React.FC = ({ children }) => {
  const [app] = useState(initializeApp(firebaseConfig));
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (!analytics) {
      setAnalytics(getAnalytics(app));
    }
  }, [analytics, app]);

  return (
    <FirebaseContext.Provider value={analytics ? { app, analytics } : null}>
      {children}
    </FirebaseContext.Provider>
  );
};

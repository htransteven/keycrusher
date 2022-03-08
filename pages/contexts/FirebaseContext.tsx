import { initializeApp, FirebaseApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { createContext, useContext, useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyAQyzr0-6NUCsnJ28ruwSQehp-ciNlAYcs",
  authDomain: "speed-typer-io.firebaseapp.com",
  databaseURL: "https://speed-typer-io-default-rtdb.firebaseio.com",
  projectId: "speed-typer-io",
  storageBucket: "speed-typer-io.appspot.com",
  messagingSenderId: "128695633430",
  appId: "1:128695633430:web:948c278b4fde0924aad737",
  measurementId: "G-Y6HQB920BN",
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
  }, [analytics]);

  return (
    <FirebaseContext.Provider value={analytics ? { app, analytics } : null}>
      {children}
    </FirebaseContext.Provider>
  );
};

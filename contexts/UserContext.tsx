import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../models/User";
import { useFirebase } from "./FirebaseContext";

interface UserContext {
  user: User | null;
  googleAccessToken?: string;
}

const UserContext = createContext<UserContext>({ user: null });

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider: React.FC = ({ children }) => {
  const { firestore, firebaseUser } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    if (!firestore) return;

    getDoc(doc(firestore, "users", firebaseUser.uid))
      .then((userDoc) =>
        userDoc.exists() ? setUser(userDoc.data() as User) : null
      )
      .catch((error) => {
        alert("An error occured when trying to find the user's document");
        console.log(error);
      });
  }, [firebaseUser, firestore]);
  return (
    <UserContext.Provider value={{ user, googleAccessToken }}>
      {children}
    </UserContext.Provider>
  );
};

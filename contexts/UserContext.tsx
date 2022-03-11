import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../models/User";
import { useFirebase } from "./FirebaseContext";

interface UserContext {
  user: User | null;
  loadingUser: boolean;
}

const UserContext = createContext<UserContext>({
  user: null,
  loadingUser: false,
});

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider: React.FC = ({ children }) => {
  const { firestore, firebaseUser } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    if (!firestore) return;

    setLoadingUser(true);
    getDoc(doc(firestore, "users", firebaseUser.uid))
      .then((userDoc) => {
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
        setLoadingUser(false);
      })
      .catch((error) => {
        alert("An error occured when trying to find the user's document");
        console.log(error);
      });
  }, [firebaseUser, firestore]);

  return (
    <UserContext.Provider value={{ user, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

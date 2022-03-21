import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../models/api/user";
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
  const { firestore, firebaseUser, setFirebaseUser } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      if (!firestore) return;

      setLoadingUser(true);
      try {
        const query = new URLSearchParams();
        query.append("email", `${firebaseUser.email}`);

        const res = await fetch(`/api/user?${query.toString()}`);
        if (!res.ok) {
          alert("failed to get user");
          console.log(await res.json());
        }
        setUser((await res.json()) as User);
      } catch (error: any) {
        console.log(error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [firebaseUser, firestore, setFirebaseUser]);

  return (
    <UserContext.Provider value={{ user, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

import { UserNetwork } from "../firestore/Network";

export interface User {
  username: string;
  email: string;
  lastLoggedIn: number;
  created: number;
  network: UserNetwork;
}

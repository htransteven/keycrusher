// differs from the UserNetwork interface in /models/api/firestore because the username is stored as key
export interface UserNetwork {
  followers: { [username: string]: boolean };
  following: { [username: string]: boolean };
}

export interface User {
  username: string;
  email: string;
  lastLoggedIn: number;
  created: number;
  network: UserNetwork;
}

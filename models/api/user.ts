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

export interface UserNetwork {
  followers: string[];
  following: string[];
}

export interface User {
  username: string;
  email: string;
  lastLoggedIn: number;
  created: number;
  network: UserNetwork;
}
